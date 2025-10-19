import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { ArrowLeft, Plus, X } from 'lucide-react';

const EditCard = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    profile_photo: '',
    bio: '',
    is_active: true,
  });
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', cardId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        title: data.title || '',
        organization: data.organization || '',
        email: data.email || '',
        phone: data.phone || '',
        profile_photo: data.profile_photo || '',
        bio: data.bio || '',
        is_active: data.is_active,
      });

      const links = Object.entries(data.social_links || {}).map(([platform, url]) => ({
        platform,
        url: url as string,
      }));
      setSocialLinks(links);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load card');
      navigate('/cards');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const socialLinksObj = socialLinks.reduce((acc, link) => {
        if (link.platform && link.url) {
          acc[link.platform] = link.url;
        }
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase
        .from('business_cards')
        .update({
          ...formData,
          social_links: socialLinksObj,
        })
        .eq('id', cardId);

      if (error) throw error;

      toast.success('Business card updated successfully!');
      navigate('/cards');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update card');
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

  if (fetching) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title="Edit Business Card - Co-Evolve Network"
        description="Edit your digital business card"
      />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button onClick={() => navigate('/cards')} variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Cards
          </Button>

          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6">Edit Business Card</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="is_active">Card Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? 'Active - visible to everyone' : 'Inactive - hidden'}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

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
                      placeholder="Platform"
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditCard;
