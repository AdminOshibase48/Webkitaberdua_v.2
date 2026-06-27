export class DeepSeekService {
    constructor() {
        // API Key must come from environment variables
        this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
        this.apiUrl = 'https://api.deepseek.com/v1';
        this.model = 'deepseek-chat';
    }

    async callAPI(messages) {
        if (!this.apiKey) {
            console.warn('DeepSeek API key not configured');
            return this.getFallbackResponse(messages);
        }

        try {
            const response = await fetch(`${this.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('DeepSeek API error:', error);
                return this.getFallbackResponse(messages);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('DeepSeek API error:', error);
            return this.getFallbackResponse(messages);
        }
    }

    getFallbackResponse(messages) {
        // Fallback responses when API is not available
        const lastMessage = messages[messages.length - 1]?.content || '';
        const lower = lastMessage.toLowerCase();

        if (lower.includes('advice') || lower.includes('relationship') || lower.includes('problem')) {
            return "Every relationship is unique, but open communication and empathy are always key. Try setting aside time to talk about what's on your mind, and remember to listen as much as you speak. 💕";
        }

        if (lower.includes('date idea') || lower.includes('what should we do')) {
            return "How about a sunset picnic in your favorite park? Pack some snacks, a cozy blanket, and maybe a playlist of songs that mean something to both of you. The golden hour is perfect for creating beautiful memories together! 🌅";
        }

        if (lower.includes('love letter') || lower.includes('write')) {
            return "My Dearest Love,\n\nI wanted to put into words what you mean to me, though I'm not sure words can ever fully capture it. You are the warmth in my morning and the peace in my night. Every moment with you is a gift I cherish deeply.\n\nWith all my love,\n— Your Person";
        }

        if (lower.includes('conversation') || lower.includes('talk about')) {
            return "What's a childhood memory that shaped who you are today? Or, if you could travel anywhere in the world together right now, where would you go and why? These questions can open up beautiful conversations. ✨";
        }

        if (lower.includes('gift') || lower.includes('present') || lower.includes('buy')) {
            return "Consider experiences over things! A pottery workshop, a cooking class, or a weekend getaway can create lasting memories. If you prefer physical gifts, think about something that reflects a shared inside joke or a special moment in your relationship. 🎁";
        }

        return "I'm here to help you create beautiful moments in your relationship. What would you like to talk about today? ❤️";
    }

    // Specific AI functions
    async getRelationshipAdvice(query) {
        const messages = [
            {
                role: 'system',
                content: 'You are a relationship advisor focused on providing warm, empathetic, and practical advice for couples.'
            },
            {
                role: 'user',
                content: query
            }
        ];
        return this.callAPI(messages);
    }

    async getDateIdeas(preferences) {
        const messages = [
            {
                role: 'system',
                content: 'You are a creative date planner who suggests romantic, fun, and memorable date ideas for couples.'
            },
            {
                role: 'user',
                content: `Suggest 3 date ideas based on these preferences: ${preferences || 'romantic, budget-friendly, indoor or outdoor'}`
            }
        ];
        return this.callAPI(messages);
    }

    async generateLoveLetter(theme) {
        const messages = [
            {
                role: 'system',
                content: 'You are a romantic poet who writes heartfelt love letters.'
            },
            {
                role: 'user',
                content: `Write a love letter about: ${theme || 'eternal love and appreciation'}`
            }
        ];
        return this.callAPI(messages);
    }

    async getConversationStarters() {
        const messages = [
            {
                role: 'system',
                content: 'You are a thoughtful conversationalist who suggests meaningful questions for couples to deepen their connection.'
            },
            {
                role: 'user',
                content: 'Suggest 5 deep conversation starters for a couple'
            }
        ];
        return this.callAPI(messages);
    }

    async getFinancialAdvice(query) {
        const messages = [
            {
                role: 'system',
                content: 'You are a financial planner who gives practical, warm advice for couples managing money together.'
            },
            {
                role: 'user',
                content: query
            }
        ];
        return this.callAPI(messages);
    }

    async getGiftIdeas(interests) {
        const messages = [
            {
                role: 'system',
                content: 'You are a gift expert who suggests thoughtful, personalized gift ideas for couples.'
            },
            {
                role: 'user',
                content: `Suggest gift ideas for a partner who likes: ${interests || 'romantic experiences, books, or music'}`
            }
        ];
        return this.callAPI(messages);
    }

    async generateMemoryCaption(prompt) {
        const messages = [
            {
                role: 'system',
                content: 'You are a poetic caption writer who creates beautiful, nostalgic captions for memories.'
            },
            {
                role: 'user',
                content: `Write a caption for a memory about: ${prompt || 'a beautiful sunset shared together'}`
            }
        ];
        return this.callAPI(messages);
    }
}

export const deepseek = new DeepSeekService();
