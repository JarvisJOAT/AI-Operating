# Food Truck Voice Agent Guide

Comprehensive guide for the AI-powered voice ordering system.

## Overview

The Food Truck Voice Agent handles phone orders using:
- **Twilio Voice** - Phone call handling
- **OpenAI Whisper** - Speech-to-text
- **GPT-4o** - Intent understanding and responses
- **OpenAI TTS** - Text-to-speech responses

## How It Works

### Call Flow

```
┌─────────────┐
│  Customer   │
│   Calls     │
└─────────────┘
      │
      ▼
┌─────────────┐     ┌─────────────┐
│   Twilio    │────▶│  Webhook    │
│   Routes    │     │  Handler    │
└─────────────┘     └─────────────┘
                          │
      ┌───────────────────┼───────────────────┐
      ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Whisper   │    │   GPT-4o    │    │    TTS      │
│   (STT)     │───▶│  (Intent)   │───▶│  (Response) │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Order     │
                   │   Created   │
                   └─────────────┘
```

### Conversation Example

```
[Phone rings]

AI: "Thank you for calling This What I Do BBQ! I'm here to help 
    you place an order. What can I get for you today?"

Customer: "I'd like a brisket plate and a pulled pork sandwich."

AI: "Great choices! So that's one brisket plate and one pulled 
    pork sandwich. The brisket plate comes with two sides - 
    what would you like? We have mac and cheese, coleslaw, 
    baked beans, potato salad, and collard greens."

Customer: "Mac and cheese and coleslaw please."

AI: "Perfect! Mac and cheese and coleslaw with your brisket plate. 
    That brings your total to $31.98 plus tax. Would you like to 
    add anything else?"

Customer: "No, that's it."

AI: "Alright! Your order total is $34.62 including tax. Can I get 
    a name for the order?"

Customer: "John"

AI: "Thanks, John! Your order will be ready in about 15 minutes. 
    We'll send you a text when it's ready for pickup. Is there 
    anything else I can help you with?"

Customer: "No, thank you!"

AI: "Thank you for ordering from This What I Do BBQ! We'll see 
    you soon. Goodbye!"
```

## Configuration

### Voice Agent Settings

```typescript
// src/services/voiceAgent.ts

const VOICE_CONFIG = {
  // OpenAI TTS voice options
  voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
  
  // Response speed
  speed: 1.0,
  
  // Max conversation duration (seconds)
  maxDuration: 300,
  
  // Silence timeout (seconds)
  silenceTimeout: 5,
  
  // Number of retries for unclear speech
  maxRetries: 3,
};
```

### System Prompt

```typescript
const SYSTEM_PROMPT = `You are a friendly phone order assistant for ${BUSINESS_NAME}, a BBQ food truck.

YOUR ROLE:
- Take food orders over the phone
- Be warm, friendly, and efficient
- Speak naturally like a real person
- Keep responses concise for phone conversation

MENU KNOWLEDGE:
${menuItemsList}

ORDER PROCESS:
1. Greet customer warmly
2. Take their order items
3. Ask about sides for plates
4. Confirm the complete order
5. Get customer name
6. Provide order total and estimated time
7. Thank them and end call

IMPORTANT RULES:
- Always confirm order items before finalizing
- Ask about sides when plates are ordered
- Mention popular items if customer is unsure
- If you can't understand, politely ask to repeat
- Stay in character as a food truck employee

TONE:
- Friendly and welcoming
- Patient and helpful
- Enthusiastic about the food`;
```

### Intent Categories

The AI recognizes these intents:

| Intent | Example Phrases |
|--------|-----------------|
| `order_item` | "I'll have a brisket plate" |
| `add_sides` | "Mac and cheese and beans" |
| `modify_order` | "Actually, make that two" |
| `remove_item` | "Cancel the sandwich" |
| `ask_menu` | "What sides do you have?" |
| `ask_price` | "How much is the ribs plate?" |
| `confirm_order` | "That's all" |
| `give_name` | "Name is John" |
| `end_call` | "Thank you, bye" |

## Webhook Handlers

### Incoming Call

```typescript
// POST /api/voice/incoming
app.post('/api/voice/incoming', async (req, res) => {
  const twiml = new VoiceResponse();
  
  // Greet customer
  twiml.say({
    voice: 'Polly.Amy',
  }, 'Thank you for calling This What I Do BBQ! I\'m here to help you place an order.');
  
  // Start gathering input
  const gather = twiml.gather({
    input: ['speech'],
    speechTimeout: 'auto',
    action: '/api/voice/process',
    method: 'POST',
  });
  
  gather.say('What can I get for you today?');
  
  // If no input, redirect
  twiml.redirect('/api/voice/no-input');
  
  res.type('text/xml');
  res.send(twiml.toString());
});
```

### Process Speech

```typescript
// POST /api/voice/process
app.post('/api/voice/process', async (req, res) => {
  const { SpeechResult, CallSid } = req.body;
  
  // Get or create conversation
  let conversation = await getConversation(CallSid);
  
  // Process with GPT
  const response = await processWithGPT(SpeechResult, conversation);
  
  // Update conversation state
  await updateConversation(CallSid, response);
  
  // Generate TwiML response
  const twiml = new VoiceResponse();
  
  if (response.shouldEnd) {
    twiml.say(response.message);
    twiml.hangup();
  } else {
    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: 'auto',
      action: '/api/voice/process',
    });
    gather.say(response.message);
    twiml.redirect('/api/voice/no-input');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});
```

## Conversation State

### State Management

```typescript
interface ConversationState {
  callSid: string;
  customerId?: string;
  customerName?: string;
  currentOrder: OrderItem[];
  orderTotal: number;
  stage: ConversationStage;
  retryCount: number;
  history: Message[];
}

enum ConversationStage {
  GREETING = 'greeting',
  TAKING_ORDER = 'taking_order',
  ASKING_SIDES = 'asking_sides',
  CONFIRMING = 'confirming',
  GETTING_NAME = 'getting_name',
  FINALIZING = 'finalizing',
  COMPLETE = 'complete',
}
```

### State Transitions

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│ GREETING │────▶│ TAKING_ORDER │────▶│ ASKING_SIDES│
└──────────┘     └──────────────┘     └─────────────┘
                       ▲                      │
                       │                      ▼
                       │              ┌───────────────┐
                       └──────────────│  CONFIRMING   │
                                      └───────────────┘
                                             │
                                             ▼
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│ COMPLETE │◀────│  FINALIZING  │◀────│ GETTING_NAME│
└──────────┘     └──────────────┘     └─────────────┘
```

## Fallback Handling

### Human Agent Transfer

When the AI can't handle a request:

```typescript
const handleFallback = async (callSid: string, reason: string) => {
  // Log the issue
  await logFallback(callSid, reason);
  
  // Transfer to human
  const twiml = new VoiceResponse();
  twiml.say('Let me connect you with someone who can help.');
  twiml.dial(BUSINESS_PHONE);
  
  return twiml;
};
```

### Fallback Triggers

- Multiple failed understanding attempts
- Customer requests human assistance
- Complex modifications or complaints
- Payment issues

### Fallback Message

```typescript
const FALLBACK_MESSAGES = {
  unclear: "I'm sorry, I didn't catch that. Could you please repeat?",
  confused: "I'm having trouble understanding. Let me connect you with someone.",
  transfer: "Please hold while I connect you with a team member.",
  error: "We're experiencing technical difficulties. Please call back shortly.",
};
```

## Testing

### Local Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3002
   ```

3. **Update Twilio webhook** with ngrok URL

4. **Call your Twilio number**

### Test Scenarios

| Scenario | Test |
|----------|------|
| Simple order | "I want a brisket plate" |
| Multiple items | "Two ribs plates and a sandwich" |
| Sides selection | "Mac and cheese and beans" |
| Order modification | "Actually, make that three" |
| Menu inquiry | "What sides do you have?" |
| Price question | "How much is the pulled pork?" |
| Unclear speech | (mumble or background noise) |
| Human transfer | "Can I speak to someone?" |

### Debug Mode

Enable verbose logging:

```env
DEBUG=food-truck:voice
LOG_LEVEL=debug
```

### Test API Endpoint

```bash
# Simulate voice input
curl -X POST http://localhost:3002/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I would like a brisket plate with mac and cheese",
    "callSid": "test-call-123"
  }'
```

## Best Practices

### Voice Response Guidelines

1. **Keep responses concise** - Phone calls require brevity
2. **Confirm important details** - Repeat back orders
3. **Use natural language** - Avoid robotic phrasing
4. **Handle interruptions** - Let customers speak

### Menu Training

Ensure the AI knows:
- All menu items and variations
- Sides options
- Common modifications
- Prices
- Popular combinations

### Error Recovery

```typescript
// Retry logic for unclear input
if (speechResult.confidence < 0.6) {
  if (conversation.retryCount < MAX_RETRIES) {
    conversation.retryCount++;
    return "I'm sorry, could you repeat that?";
  } else {
    return handleFallback(callSid, 'max_retries_exceeded');
  }
}
```

### Performance Optimization

- Cache menu data
- Pre-generate common responses
- Use streaming for faster TTS
- Minimize API calls

## Monitoring

### Metrics to Track

| Metric | Description |
|--------|-------------|
| Call completion rate | % of calls resulting in orders |
| Average call duration | Time from answer to hangup |
| Fallback rate | % transferred to human |
| Order accuracy | Orders without corrections |
| Customer satisfaction | Post-call survey scores |

### Logging

```typescript
// Log all conversations
const logConversation = async (data: ConversationLog) => {
  await supabase.from('voice_conversations').insert({
    call_sid: data.callSid,
    customer_phone: data.phone,
    transcript: data.messages,
    order_id: data.orderId,
    duration: data.duration,
    outcome: data.outcome,
    fallback_reason: data.fallbackReason,
  });
};
```

## Advanced Configuration

### Custom Voice

```typescript
// Use a specific Twilio voice
twiml.say({
  voice: 'Polly.Amy', // British female
  language: 'en-GB',
}, message);

// Or use OpenAI TTS
const audio = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'nova',
  input: message,
});
```

### Multi-language Support

```typescript
// Detect language and respond accordingly
const detectLanguage = (text: string) => {
  // Use language detection
  return 'en'; // or 'es', 'fr', etc.
};

const SYSTEM_PROMPTS = {
  en: 'You are a friendly order assistant...',
  es: 'Eres un asistente de pedidos amigable...',
};
```

### Business Hours

```typescript
const isBusinessHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Open 11am-8pm, closed Sunday (0)
  return day !== 0 && hour >= 11 && hour < 20;
};

// In webhook
if (!isBusinessHours()) {
  twiml.say('Sorry, we are currently closed. Our hours are 11am to 8pm, Monday through Saturday.');
  twiml.hangup();
}
```

---

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [User Manual](./USER_MANUAL.md)

