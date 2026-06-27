import { supabase } from './assets/js/services/supabase.js';

export class FinanceService {
    static async addTransaction(coupleId, userId, data) {
        const { type, amount, category, description, date, reference, receipt_url } = data;
        
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                type: type, // 'income' or 'expense'
                amount: amount,
                category: category,
                description: description,
                date: date || new Date().toISOString().split('T')[0],
                reference: reference,
                receipt_url: receipt_url,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Update budget if expense
        if (type === 'expense' && category) {
            await this.updateBudgetSpent(coupleId, category, amount);
        }
        
        return transaction;
    }

    static async getTransactions(coupleId, limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `)
            .eq('couple_id', coupleId)
            .order('date', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data;
    }

    static async getTransactionSummary(coupleId, period = 'month') {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        const { data, error } = await supabase
            .from('transactions')
            .select('type, amount, category')
            .eq('couple_id', coupleId)
            .gte('date', startDate.toISOString().split('T')[0]);
        
        if (error) throw error;
        
        const summary = {
            income: 0,
            expenses: 0,
            balance: 0,
            byCategory: {}
        };
        
        data.forEach(t => {
            if (t.type === 'income') {
                summary.income += t.amount;
            } else {
                summary.expenses += t.amount;
                if (!summary.byCategory[t.category]) {
                    summary.byCategory[t.category] = 0;
                }
                summary.byCategory[t.category] += t.amount;
            }
        });
        
        summary.balance = summary.income - summary.expenses;
        
        // Calculate percentages
        const totalExpenses = summary.expenses || 1;
        Object.keys(summary.byCategory).forEach(cat => {
            summary.byCategory[cat] = {
                amount: summary.byCategory[cat],
                percentage: (summary.byCategory[cat] / totalExpenses) * 100
            };
        });
        
        return summary;
    }

    static async createBudget(coupleId, category, amount, period = 'month') {
        const { data, error } = await supabase
            .from('budgets')
            .insert({
                couple_id: coupleId,
                category: category,
                amount: amount,
                period: period,
                spent: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getBudgets(coupleId) {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    static async updateBudgetSpent(coupleId, category, amount) {
        // Find the budget for this category
        const { data: budget, error: findError } = await supabase
            .from('budgets')
            .select('*')
            .eq('couple_id', coupleId)
            .eq('category', category)
            .single();
        
        if (findError) return; // No budget for this category
        
        const { error } = await supabase
            .from('budgets')
            .update({ spent: budget.spent + amount })
            .eq('id', budget.id);
        
        if (error) throw error;
    }

    static async createSavingsGoal(coupleId, userId, name, target, current = 0) {
        const { data, error } = await supabase
            .from('savings_goals')
            .insert({
                couple_id: coupleId,
                user_id: userId,
                name: name,
                target_amount: target,
                current_amount: current,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async getSavingsGoals(coupleId) {
        const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    static async updateSavingsGoal(goalId, amount) {
        const { data: goal, error: getError } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('id', goalId)
            .single();
        
        if (getError) throw getError;
        
        const newAmount = goal.current_amount + amount;
        const { data, error } = await supabase
            .from('savings_goals')
            .update({ 
                current_amount: newAmount,
                updated_at: new Date().toISOString()
            })
            .eq('id', goalId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    static async deleteSavingsGoal(goalId) {
        const { error } = await supabase
            .from('savings_goals')
            .delete()
            .eq('id', goalId);
        
        if (error) throw error;
    }

    static async uploadReceipt(coupleId, file) {
        const filePath = `receipts/${coupleId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
        
        return publicUrl;
    }

    static subscribeToTransactions(coupleId, callback) {
        return supabase
            .channel('finance-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `couple_id=eq.${coupleId}`
                },
                callback
            )
            .subscribe();
    }
}
