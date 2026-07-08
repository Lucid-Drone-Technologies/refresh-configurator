import { redirect } from 'next/navigation';

// Root always routes to the Refresh slug so inbound URLs are never blank.
// Refresh and CapEx each have their own slug for intent-based lead routing.
export default function Page() {
  redirect('/refresh');
}
