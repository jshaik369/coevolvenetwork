import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Download, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { QRCodeSVG } from 'qrcode.react';

interface BusinessCard {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  profile_photo?: string;
  bio?: string;
  social_links: any;
}

const CardView = () => {
  const { uniqueId } = useParams();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const fetchCard = async () => {
      if (!uniqueId) return;

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('unique_id', uniqueId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Card not found');
        setLoading(false);
        return;
      }

      setCard(data);
      setLoading(false);

      // Track initial view
      trackAnalytics(data.id, 'page_view', {});
    };

    fetchCard();

    // Track time on page and unload
    const handleBeforeUnload = () => {
      if (card) {
        const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
        trackAnalytics(card.id, 'page_exit', { time_on_page: timeOnPage }, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uniqueId]);

  const trackAnalytics = async (
    cardId: string,
    eventType: string,
    eventData: any,
    isBeforeUnload = false
  ) => {
    const analyticsData = {
      card_id: cardId,
      session_id: sessionId,
      viewer_id: (await supabase.auth.getUser()).data.user?.id || null,
      timestamp: new Date().toISOString(),
      time_on_page: eventData.time_on_page || 0,
      interactions: eventData,
      location: {},
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      user_agent: navigator.userAgent,
      device_info: {
        platform: navigator.platform,
        language: navigator.language,
      },
      click_events: eventType === 'click' ? [eventData] : [],
      is_before_unload: isBeforeUnload,
    };

    if (isBeforeUnload) {
      navigator.sendBeacon(
        `https://gvmmwtfavsrhtaqqybbu.supabase.co/rest/v1/business_card_analytics`,
        JSON.stringify(analyticsData)
      );
    } else {
      await supabase.from('business_card_analytics').insert(analyticsData);
    }
  };

  const handleClick = (action: string, data: any = {}) => {
    if (card) {
      trackAnalytics(card.id, 'click', { action, ...data });
    }
  };

  const downloadVCard = () => {
    if (!card) return;

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
${card.title ? `TITLE:${card.title}` : ''}
${card.organization ? `ORG:${card.organization}` : ''}
${card.email ? `EMAIL:${card.email}` : ''}
${card.phone ? `TEL:${card.phone}` : ''}
${card.bio ? `NOTE:${card.bio}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    handleClick('vcard_download');
    toast.success('Contact card downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Card Not Found</h1>
          <p className="text-muted-foreground">
            This business card doesn't exist or has been deactivated.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${card.name} - Business Card`}
        description={card.bio || `Digital business card for ${card.name}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <Card className="p-8 backdrop-blur-sm bg-card/95 border-2">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-6">
                {card.profile_photo ? (
                  <img
                    src={card.profile_photo}
                    alt={card.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <span className="text-4xl font-bold text-primary">
                      {card.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
              {card.title && (
                <p className="text-xl text-muted-foreground mb-1">{card.title}</p>
              )}
              {card.organization && (
                <p className="text-lg text-muted-foreground">{card.organization}</p>
              )}
            </div>

            {/* Bio */}
            {card.bio && (
              <p className="text-center mb-8 text-muted-foreground max-w-lg mx-auto">
                {card.bio}
              </p>
            )}

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {card.email && (
                <Button
                  onClick={() => {
                    handleClick('email_click', { email: card.email });
                    window.location.href = `mailto:${card.email}`;
                  }}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}
              {card.phone && (
                <Button
                  onClick={() => {
                    handleClick('phone_click', { phone: card.phone });
                    window.location.href = `tel:${card.phone}`;
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              )}
              <Button
                onClick={downloadVCard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Save Contact
              </Button>
            </div>

            {/* Social Links */}
            {Object.keys(card.social_links).length > 0 && (
              <div className="border-t pt-6 mb-6">
                <h3 className="text-sm font-semibold mb-3 text-center">Connect</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(card.social_links).map(([platform, url]) => (
                    <Button
                      key={platform}
                      onClick={() => {
                        handleClick('social_click', { platform, url });
                        window.open(url as string, '_blank');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Share this card</p>
              <div className="inline-block p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={window.location.href}
                  size={128}
                  level="H"
                  includeMargin
                />
              </div>
            </div>
          </Card>

          {/* C.E.Network Branding */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <a
                href="/"
                className="text-primary hover:underline font-semibold"
                onClick={() => handleClick('branding_click')}
              >
                Co-Evolve Network
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardView;
