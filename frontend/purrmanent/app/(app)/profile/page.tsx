import { PageHeader } from '@/components/layout/app-shell';
import { Card } from '@/components/ui';
import { ProfilePhotoUpload } from '@/features/auth/profile-photo-upload';
import { ProfileForm } from '@/features/auth/profile-form';

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your account details and photo."
      />
      <Card className="max-w-lg space-y-6">
        <ProfilePhotoUpload />
        <ProfileForm />
      </Card>
    </>
  );
}
