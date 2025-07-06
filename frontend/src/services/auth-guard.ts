import { redirect } from '@tanstack/react-router';
import { AuthService } from '@/services/auth.service';

export async function checkAuth(location: { href: string }) {
  try {
    // Try to get the user profile - thiw will throw an error if not authenticated
    await AuthService.getProfile();
    // If we get here, the user is authenticated
    return true;
  } catch {
    // User is not authenticated, redirect to login
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    });
  }
}

// Alternative funciont that doesn't throw redirect (useful for conditional checks)
export async function isAuthenticated(): Promise<boolean> {
  try {
    await AuthService.getProfile();
    return true;
  } catch {
    return false;
  }
}