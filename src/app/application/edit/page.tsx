"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import EditableApplicationForm from "./EditableApplicationForm";

interface ApplicationData {
  id: string;
  listing_id: string;
  status: string;
  full_name: string;
  email: string;
  [key: string]: unknown;
}

function EditApplicationPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState<ApplicationData | null>(null);

  useEffect(() => {
    async function validateAndLoadApplication() {
      if (!token) {
        setError("No edit token provided.");
        setLoading(false);
        return;
      }

      try {
        // Query Supabase for application with this token
        const { data, error: queryError } = await supabase
          .from("applications")
          .select("*")
          .eq("edit_token", token)
          .single();

        if (queryError || !data) {
          setError("This edit link is invalid or not found.");
          setLoading(false);
          return;
        }

        const app = data as ApplicationData;

        // Check if token has expired
        if (app.edit_token_expires_at) {
          const expiresAt = new Date(app.edit_token_expires_at as string);
          if (expiresAt < new Date()) {
            setError("This edit link has expired. You can no longer edit this application.");
            setLoading(false);
            return;
          }
        }

        // Check if application status allows editing (only "new" or "pending")
        if (!["new", "pending", "under_review"].includes(app.status as string)) {
          setError(
            `This application has been ${app.status === "approved" ? "approved" : app.status === "denied" ? "denied" : app.status}. You can no longer edit it.`
          );
          setLoading(false);
          return;
        }

        setApplication(app);
      } catch (err) {
        setError("An error occurred. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    validateAndLoadApplication();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">Unable to Edit Application</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-4">
            If you believe this is an error, please contact us directly.
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <p className="text-gray-600">Application not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Your Application</h1>
        <p className="text-gray-600">
          You can update your application details below. Your changes will be saved securely.
        </p>
        {(application as any).edit_token_expires_at && (
          <p className="text-sm text-gray-500 mt-3">
            Edit link expires on: <strong>{new Date((application as any).edit_token_expires_at as string).toLocaleDateString()}</strong>
          </p>
        )}
      </div>

      <EditableApplicationForm 
        application={application as any} 
        token={token!}
        onSaveSuccess={() => {
          // Successfully saved
        }}
      />
    </div>
  );
}

function EditApplicationPageLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading your application...</p>
      </div>
    </div>
  );
}

export default function EditApplicationPage() {
  return (
    <Suspense fallback={<EditApplicationPageLoadingFallback />}>
      <EditApplicationPageContent />
    </Suspense>
  );
}
