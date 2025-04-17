import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Project } from '@/types';
import { Client } from '@/types/client';

/**
 * Checks if a user has access to a project
 * @param userId The ID of the user to check
 * @param projectId The ID of the project to check access for
 * @returns A promise that resolves to a boolean indicating if the user has access
 */
export async function hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
  try {
    // Get the project document
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
    if (!projectDoc.exists()) {
      return false;
    }
    
    const project = projectDoc.data() as Project;
    
    // Check if user is a team member
    const isTeamMember = project.teamMembers.some(member => member.id === userId);
    if (isTeamMember) {
      return true;
    }
    
    // Check if user is a client assigned to the project
    const clientDoc = await getDoc(doc(db, 'clients', userId));
    if (clientDoc.exists()) {
      const client = clientDoc.data() as Client;
      return client.assignedProjects.includes(projectId);
    }
    
    // Check if user is an admin
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking project access:', error);
    return false;
  }
}

/**
 * Gets all projects a client has access to
 * @param clientId The ID of the client
 * @returns A promise that resolves to an array of project IDs
 */
export async function getClientProjects(clientId: string): Promise<string[]> {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    
    if (!clientDoc.exists()) {
      return [];
    }
    
    const client = clientDoc.data() as Client;
    return client.assignedProjects;
  } catch (error) {
    console.error('Error getting client projects:', error);
    return [];
  }
}

/**
 * Gets all clients assigned to a project
 * @param projectId The ID of the project
 * @returns A promise that resolves to an array of client IDs
 */
export async function getProjectClients(projectId: string): Promise<string[]> {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
    if (!projectDoc.exists()) {
      return [];
    }
    
    const project = projectDoc.data() as Project;
    return project.clients || [];
  } catch (error) {
    console.error('Error getting project clients:', error);
    return [];
  }
} 