import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Plus, Eye, Edit, Trash2, BarChart3, Copy } from 'lucide-react';

interface BusinessCard {
  id: string;
  unique_id: string;
  name: string;
  title?: string;
  organization?: string;
  is_active: boolean;
  created_at: string;
}

const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to view your cards');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (uniqueId: string) => {
    const url = `${window.location.origin}/card/${uniqueId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Card deleted successfully');
      fetchCards();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete card');
    }
  };

  if (loading) {
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
        title="My Business Cards - Co-Evolve Network"
        description="Manage your digital business cards"
      />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Business Cards</h1>
            <Button onClick={() => navigate('/card/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Card
            </Button>
          </div>

          {cards.length === 0 ? (
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">No cards yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first business card to get started
              </p>
              <Button onClick={() => navigate('/card/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Card
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">{card.name}</h3>
                    {card.title && (
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                    )}
                    {card.organization && (
                      <p className="text-sm text-muted-foreground">{card.organization}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span className={card.is_active ? 'text-green-600' : 'text-red-600'}>
                      {card.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => navigate(`/card/${card.unique_id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => navigate(`/card/edit/${card.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => navigate(`/card/analytics/${card.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    <Button
                      onClick={() => copyLink(card.unique_id)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => deleteCard(card.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MyCards;
