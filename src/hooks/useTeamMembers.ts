import { useState, useCallback } from "react";
import { TeamMember } from "@/types";
import { mockProjects } from "@/data/mockData";

export function useTeamMembers(projectId: string) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const project = Object.values(mockProjects).find(p => p.id === projectId);
    return project?.teamMembers || [];
  });

  const addMember = useCallback(async (member: Omit<TeamMember, "id" | "status">) => {
    // In a real app, this would make an API call
    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`,
      status: "pending",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`
    };

    setTeamMembers(prev => [...prev, newMember]);

    // Update mock data
    const project = Object.values(mockProjects).find(p => p.id === projectId);
    if (project) {
      project.teamMembers = [...project.teamMembers, newMember];
    }

    return newMember;
  }, [projectId]);

  const updateRole = useCallback(async (memberId: string, role: TeamMember["role"]) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, role, status: member.status === "pending" ? "active" : member.status }
          : member
      )
    );

    // Update mock data
    const project = Object.values(mockProjects).find(p => p.id === projectId);
    if (project) {
      project.teamMembers = project.teamMembers.map(member =>
        member.id === memberId
          ? { ...member, role, status: member.status === "pending" ? "active" : member.status }
          : member
      );
    }
  }, [projectId]);

  const removeMember = useCallback(async (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));

    // Update mock data
    const project = Object.values(mockProjects).find(p => p.id === projectId);
    if (project) {
      project.teamMembers = project.teamMembers.filter(member => member.id !== memberId);
    }
  }, [projectId]);

  return {
    teamMembers,
    addMember,
    updateRole,
    removeMember
  };
} 