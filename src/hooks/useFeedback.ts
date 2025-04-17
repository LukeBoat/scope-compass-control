import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import type { Feedback } from "@/types";
import { useClientMode } from "@/hooks/useClientMode";

export function useFeedback() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isClientMode } = useClientMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFeedback = async (
    deliverableId: string, 
    content: string, 
    status: Feedback["status"] = "info",
    tags?: string[]
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive",
      });
      return;
    }

    // Validate permissions
    if (status === "approved" || status === "change-requested") {
      if (!isClientMode) {
        toast({
          title: "Error",
          description: "Only clients can approve or request changes",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Create the feedback document
      const feedbackRef = await addDoc(collection(db, "deliverables", deliverableId, "feedback"), {
        content,
        author: user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        status,
        tags: tags || [],
        resolved: false,
        role: isClientMode ? "client" : "admin"
      });

      // If this is an approval or change request, update the deliverable status
      if (status === "approved" || status === "change-requested") {
        const deliverableRef = doc(db, "deliverables", deliverableId);
        await updateDoc(deliverableRef, {
          status: status === "approved" ? "Approved" : "In Review",
          lastUpdated: serverTimestamp(),
        });
      }

      // Show success toast with appropriate message
      toast({
        title: status === "approved" 
          ? "Deliverable Approved" 
          : status === "change-requested"
          ? "Changes Requested"
          : "Feedback Added",
        description: status === "approved" 
          ? "The deliverable has been marked as approved" 
          : status === "change-requested"
          ? "Your change request has been submitted"
          : "Your feedback has been added successfully",
        variant: status === "approved" ? "default" : "default",
      });

      return feedbackRef.id;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFeedbackStatus = async (
    deliverableId: string, 
    feedbackId: string, 
    status: Feedback["status"],
    override = false
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update feedback",
        variant: "destructive",
      });
      return;
    }

    // Validate permissions
    if (!isClientMode && !override) {
      toast({
        title: "Error",
        description: "Only clients can update feedback status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackRef = doc(db, "deliverables", deliverableId, "feedback", feedbackId);
      await updateDoc(feedbackRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: user.displayName || user.email,
        updatedById: user.uid,
        override: override || false
      });

      // If this is an approval or change request, update the deliverable status
      if (status === "approved" || status === "change-requested") {
        const deliverableRef = doc(db, "deliverables", deliverableId);
        await updateDoc(deliverableRef, {
          status: status === "approved" ? "Approved" : "In Review",
          lastUpdated: serverTimestamp(),
        });
      }

      toast({
        title: status === "approved" 
          ? "Status Updated to Approved" 
          : status === "change-requested"
          ? "Changes Requested"
          : "Status Updated",
        description: status === "approved" 
          ? "The deliverable has been marked as approved" 
          : status === "change-requested"
          ? "Changes have been requested for this deliverable"
          : "The feedback status has been updated",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      toast({
        title: "Error",
        description: "Failed to update feedback status. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveFeedback = async (deliverableId: string, feedbackId: string) => {
    if (!user || isClientMode) {
      toast({
        title: "Error",
        description: "Only admins can resolve feedback",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackRef = doc(db, "deliverables", deliverableId, "feedback", feedbackId);
      await updateDoc(feedbackRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy: user.displayName || user.email,
        resolvedById: user.uid
      });

      toast({
        title: "Feedback Resolved",
        description: "The feedback has been marked as resolved and closed",
        variant: "default",
      });
    } catch (error) {
      console.error("Error resolving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to resolve feedback. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addFeedback,
    updateFeedbackStatus,
    resolveFeedback,
    isSubmitting,
  };
} 