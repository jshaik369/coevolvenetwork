import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
  timestamp?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, honeypot, timestamp }: EmailRequest = await req.json();

    // Bot detection - honeypot check
    if (honeypot && honeypot.trim() !== '') {
      console.log('Bot detected via honeypot');
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Bot detection - time check (form filled too quickly)
    if (timestamp) {
      const now = Date.now();
      const timeDiff = now - timestamp;
      if (timeDiff < 3000) { // Less than 3 seconds
        console.log('Bot detected via time check');
        return new Response(JSON.stringify({ error: 'Form submitted too quickly' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get EmailJS credentials from environment
    const serviceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const templateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');

    if (!serviceId || !templateId || !publicKey) {
      console.error('Missing EmailJS configuration');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send email via EmailJS API
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: name,
          from_email: email,
          message: message,
          to_name: 'Co-Evolve Team',
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('EmailJS error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Email sent successfully');
    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);