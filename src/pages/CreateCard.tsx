import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { ArrowLeft, Plus, X } from 'lucide-react';

const CreateCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    profile_photo: '',
    bio: '',
  });
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a card');
        return;
      }

      // Generate unique ID
      const { data: uniqueIdData, error: uniqueIdError } = await supabase.rpc(
        'generate_card_unique_id'
      );

      if (uniqueIdError) throw uniqueIdError;

      const socialLinksObj = socialLinks.reduce((acc, link) => {
        if (link.platform && link.url) {
          acc[link.platform] = link.url;
        }
        return acc;
      }, {} as Record<string, string>);

      const { data, error } = await supabase
        .from('business_cards')
        .insert({
          user_id: user.id,
          unique_id: uniqueIdData,
          ...formData,
          social_links: socialLinksObj,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Business card created successfully!');
      navigate(`/card/${data.unique_id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  return (
    <PageLayout>
      <SEO
        title="Create Business Card - Co-Evolve Network"
        description="Create your digital business card"
      />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6">Create Your Business Card</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="CEO & Founder"
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    placeholder="Company Name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="profile_photo">Profile Photo URL</Label>
                  <Input
                    id="profile_photo"
                    type="url"
                    value={formData.profile_photo}
                    onChange={(e) =>
                      setFormData({ ...formData, profile_photo: e.target.value })
                    }
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="A brief description about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Social Links</h2>
                  <Button
                    type="button"
                    onClick={addSocialLink}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Platform (e.g., LinkedIn)"
                      value={link.platform}
                      onChange={(e) =>
                        updateSocialLink(index, 'platform', e.target.value)
                      }
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Business Card'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateCard;
