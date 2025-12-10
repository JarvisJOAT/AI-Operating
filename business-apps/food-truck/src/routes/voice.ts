/**
 * Voice Routes
 * 
 * API endpoints for AI voice agent using Twilio.
 * 
 * @module routes/voice
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import Twilio from 'twilio';
import OpenAI from 'openai';

const router = Router();

// Initialize clients
const twilioClient = new Twilio.Twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// TwiML Voice Response helper
const VoiceResponse = Twilio.twiml.VoiceResponse;

/**
 * System prompt for the voice agent
 */
const VOICE_AGENT_PROMPT = `You are a friendly and efficient voice assistant for a BBQ food truck called "This What I Do BBQ". 
Your job is to help customers place orders over the phone.

Menu items available:
- Brisket Plate ($16) - includes 2 sides
- Pulled Pork Plate ($14) - includes 2 sides
- Ribs (Half Rack $18, Full Rack $32)
- Brisket Sandwich ($12)
- Pulled Pork Sandwich ($10)
- Combo Plate ($22) - brisket + ribs + 2 sides

Sides ($4 each): Mac & Cheese, Coleslaw, Baked Beans, Potato Salad, Cornbread

Drinks ($3): Sweet Tea, Unsweet Tea, Lemonade, Coke, Sprite, Water ($2)

Guidelines:
1. Be warm and welcoming
2. Speak clearly and at a moderate pace
3. Confirm each item as it's added
4. Repeat the full order before confirming
5. Ask for customer name and phone number
6. Provide estimated wait time (usually 10-15 minutes)
7. If you can't understand something, politely ask to repeat

If the customer asks for something not on the menu, politely explain what's available.
If they seem frustrated or request a human, offer to transfer to a staff member.`;

/**
 * POST /api/voice/incoming
 * Handle incoming voice call (Twilio webhook)
 */
router.post('/incoming', async (req: Request, res: Response) => {
  try {
    const { CallSid, From, To } = req.body;
    
    logger.info('Incoming call:', { callSid: CallSid, from: From });

    // Create call record
    await supabase.from('voice_calls').insert({
      organization_id: process.env.DEFAULT_ORG_ID || '',
      call_sid: CallSid,
      caller_phone: From,
      status: 'initiated',
      transcript: [],
    });

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // Welcome message
    twiml.say({
      voice: 'Polly.Matthew',
    }, 'Welcome to This What I Do BBQ! I\'m your AI assistant. How can I help you today? You can place an order or ask about our menu.');

    // Gather speech input
    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      enhanced: true,
      action: '/api/voice/process',
      method: 'POST',
    });

    gather.say({
      voice: 'Polly.Matthew',
    }, 'Please tell me what you\'d like to order.');

    // If no input, prompt again
    twiml.redirect('/api/voice/incoming');

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error('Error handling incoming call:', error);
    
    const twiml = new VoiceResponse();
    twiml.say('I\'m sorry, we\'re experiencing technical difficulties. Please call back or visit us in person.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

/**
 * POST /api/voice/process
 * Process speech input and generate response
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { CallSid, SpeechResult, Confidence } = req.body;

    logger.info('Processing speech:', {
      callSid: CallSid,
      speech: SpeechResult,
      confidence: Confidence,
    });

    // Get existing call record
    const { data: callRecord } = await supabase
      .from('voice_calls')
      .select('*')
      .eq('call_sid', CallSid)
      .single();

    // Add to transcript
    const transcript = callRecord?.transcript || [];
    transcript.push({
      role: 'customer',
      content: SpeechResult,
      timestamp: new Date().toISOString(),
    });

    // Check for transfer request
    if (SpeechResult?.toLowerCase().includes('speak to someone') ||
        SpeechResult?.toLowerCase().includes('human') ||
        SpeechResult?.toLowerCase().includes('transfer')) {
      return handleTransfer(res, CallSid);
    }

    // Generate AI response
    const aiResponse = await generateVoiceResponse(transcript);

    // Add AI response to transcript
    transcript.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // Update call record
    await supabase
      .from('voice_calls')
      .update({
        transcript,
        status: 'in_progress',
      })
      .eq('call_sid', CallSid);

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    twiml.say({
      voice: 'Polly.Matthew',
    }, aiResponse);

    // Continue gathering input
    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      enhanced: true,
      action: '/api/voice/process',
      method: 'POST',
    });

    gather.say({
      voice: 'Polly.Matthew',
    }, 'Is there anything else?');

    twiml.redirect('/api/voice/process');

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error('Error processing speech:', error);
    
    const twiml = new VoiceResponse();
    twiml.say('I\'m sorry, I didn\'t catch that. Could you please repeat?');
    twiml.redirect('/api/voice/incoming');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

/**
 * Generate AI response using OpenAI
 */
async function generateVoiceResponse(transcript: any[]): Promise<string> {
  try {
    const messages: any[] = [
      { role: 'system', content: VOICE_AGENT_PROMPT },
    ];

    // Add conversation history
    for (const entry of transcript) {
      messages.push({
        role: entry.role === 'customer' ? 'user' : 'assistant',
        content: entry.content,
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 150, // Keep responses concise for voice
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 
      'I apologize, I\'m having trouble processing that. Could you repeat your order?';
  } catch (error) {
    logger.error('Error generating AI response:', error);
    return 'I apologize, I\'m having trouble understanding. Let me transfer you to a staff member.';
  }
}

/**
 * Handle transfer to human agent
 */
function handleTransfer(res: Response, callSid: string) {
  const twiml = new VoiceResponse();
  
  twiml.say({
    voice: 'Polly.Matthew',
  }, 'No problem! Let me transfer you to one of our team members. Please hold.');

  // Transfer to configured number
  twiml.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER,
  }, process.env.TRANSFER_PHONE_NUMBER || '');

  // Update call status
  supabase
    .from('voice_calls')
    .update({
      status: 'transferred',
      transferred_to: process.env.TRANSFER_PHONE_NUMBER,
    })
    .eq('call_sid', callSid);

  res.type('text/xml');
  res.send(twiml.toString());
}

/**
 * POST /api/voice/status
 * Handle call status webhook
 */
router.post('/status', async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;

    logger.info('Call status update:', {
      callSid: CallSid,
      status: CallStatus,
      duration: CallDuration,
    });

    if (CallStatus === 'completed') {
      await supabase
        .from('voice_calls')
        .update({
          status: 'completed',
          duration_seconds: parseInt(CallDuration) || 0,
          ended_at: new Date().toISOString(),
        })
        .eq('call_sid', CallSid);
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling status webhook:', error);
    res.sendStatus(500);
  }
});

/**
 * GET /api/voice/calls
 * Get call history
 */
router.get('/calls', async (req: Request, res: Response) => {
  try {
    const { organizationId, limit = 50 } = req.query;

    let query = supabase
      .from('voice_calls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching calls:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch calls' });
  }
});

/**
 * GET /api/voice/calls/:id
 * Get a specific call with transcript
 */
router.get('/calls/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('voice_calls')
      .select(`
        *,
        orders (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching call:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch call' });
  }
});

export default router;

