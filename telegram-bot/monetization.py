import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CallbackQueryHandler
from database import Database
from config import Config

logger = logging.getLogger(__name__)

class Monetization:
    def __init__(self, db: Database):
        self.db = db

    async def handle_payment_link(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle payment link requests"""
        user_id = update.effective_user.id
        message = update.message
        
        # Check if user already has premium
        user_data = await self.db.get_user(user_id)
        if user_data and user_data.get('is_premium'):
            await message.reply_text(
                "You already have premium access! 🎉\n"
                "Use /portal to access premium content."
            )
            return

        # Generate payment link
        payment_link = await self.generate_payment_link(user_id)
        
        keyboard = [
            [InlineKeyboardButton("💳 Pay with Stripe", url=payment_link)],
            [InlineKeyboardButton("💰 View Pricing", callback_data="pricing_info")],
            [InlineKeyboardButton("❓ How it Works", callback_data="how_it_works")]
        ]
        
        await message.reply_text(
            "🚀 *Unlock Premium Imperium Access*\n\n"
            "Get access to:\n"
            "• All 28 Principles\n"
            "• Daily Intelligence Briefs\n"
            "• Inner Circle Community\n"
            "• Exclusive Content\n\n"
            f"Payment Link: {payment_link}\n\n"
            "After payment, use /verify_payment to activate your premium status.",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )

    async def handle_verify_payment(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Verify payment status"""
        user_id = update.effective_user.id
        message = update.message
        
        # Check payment status
        payment_status = await self.check_payment_status(user_id)
        
        if payment_status.get('status') == 'completed':
            # Activate premium
            await self.activate_premium(user_id, payment_status['subscription_id'])
            
            await message.reply_text(
                "🎉 *Payment Verified Successfully!*\n\n"
                "Your premium access has been activated!\n"
                "Use /portal to access premium content.\n\n"
                "Welcome to the Inner Circle! 👑"
            )
        else:
            await message.reply_text(
                "❌ *Payment Not Found*\n\n"
                "Please ensure you've completed the payment.\n"
                "If you've already paid, please wait a few minutes and try again.\n\n"
                "Use /payment_link to get a new payment link."
            )

    async def handle_pricing_info(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show pricing information"""
        keyboard = [
            [InlineKeyboardButton("💳 Get Payment Link", callback_data="get_payment_link")],
            [InlineKeyboardButton("↩️ Back to Menu", callback_data="main_menu")]
        ]
        
        await update.callback_query.edit_message_text(
            "💰 *Imperium Premium Pricing*\n\n"
            "• *Foundation*: $20/month\n"
            "  - All 28 Principles\n"
            "  - Daily Intelligence Briefs\n\n"
            "• *Elite*: $50/month\n"
            "  - Everything in Foundation\n"
            "  - Inner Circle Access\n"
            "  - Exclusive Content\n\n"
            "• *Sovereign*: $100/month\n"
            "  - Everything in Elite\n"
            "  - 1-on-1 Strategy Sessions\n"
            "  - Priority Support\n\n"
            "All plans include a 7-day free trial. Cancel anytime.",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )

    async def handle_referral_program(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle referral program"""
        user_id = update.effective_user.id
        user_data = await self.db.get_user(user_id)
        
        if not user_data:
            await self.db.create_user(user_id, update.effective_user.username)
            user_data = await self.db.get_user(user_id)
        
        referral_code = user_data.get('referral_code')
        if not referral_code:
            referral_code = await self.generate_referral_code(user_id)
        
        earnings = await self.get_referral_earnings(user_id)
        
        keyboard = [
            [InlineKeyboardButton("📤 Share Referral Link", callback_data="share_referral")],
            [InlineKeyboardButton("📊 View Earnings", callback_data="view_earnings")],
            [InlineKeyboardButton("↩️ Back to Menu", callback_data="main_menu")]
        ]
        
        await update.message.reply_text(
            f"👥 *Your Referral Program*\n\n"
            f"Your Referral Code: `{referral_code}`\n\n"
            f"Current Earnings: ${earnings:.2f}\n\n"
            "Earn 10% commission on every referral!\n"
            "Share your code and build your empire.",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )

    async def generate_payment_link(self, user_id: int) -> str:
        """Generate Stripe payment link"""
        # This would integrate with your Stripe setup
        base_url = "https://buy.stripe.com/"
        return f"{base_url}4gM4gyfOs2V64an8Dd5AQ07?client_reference_id={user_id}"

    async def check_payment_status(self, user_id: int) -> Dict[str, Any]:
        """Check payment status from database"""
        payment_data = await self.db.get_payment_status(user_id)
        return payment_data or {'status': 'pending'}

    async def activate_premium(self, user_id: int, subscription_id: str):
        """Activate premium status for user"""
        await self.db.update_user_premium_status(user_id, True, subscription_id)
        
        # Log revenue
        await self.db.log_revenue(
            user_id=user_id,
            amount=20.00,  # Monthly subscription
            currency='USD',
            source='telegram_bot',
            metadata={'subscription_id': subscription_id}
        )

    async def generate_referral_code(self, user_id: int) -> str:
        """Generate unique referral code"""
        import random
        import string
        
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        await self.db.update_referral_code(user_id, code)
        return code

    async def get_referral_earnings(self, user_id: int) -> float:
        """Get total referral earnings"""
        earnings = await self.db.get_referral_earnings(user_id)
        return earnings or 0.0

    async def handle_affiliate_application(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle affiliate program application"""
        user_id = update.effective_user.id
        user_data = await self.db.get_user(user_id)
        
        if not user_data:
            await self.db.create_user(user_id, update.effective_user.username)
            user_data = await self.db.get_user(user_id)
        
        if user_data.get('is_affiliate'):
            await update.message.reply_text(
                "You're already an affiliate! 🎉\n"
                "Use /affiliate_dashboard to view your stats."
            )
            return
        
        keyboard = [
            [InlineKeyboardButton("📝 Apply Now", callback_data="apply_affiliate")],
            [InlineKeyboardButton("↩️ Back to Menu", callback_data="main_menu")]
        ]
        
        await update.message.reply_text(
            "💼 *Imperium Affiliate Program*\n\n"
            "Earn 15% commission on every referral!\n\n"
            "Requirements:\n"
            "• Active Telegram user\n"
            "• 100+ followers\n"
            "• Commitment to growth\n\n"
            "Ready to join the affiliate program?",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )

    async def handle_affiliate_dashboard(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show affiliate dashboard"""
        user_id = update.effective_user.id
        user_data = await self.db.get_user(user_id)
        
        if not user_data or not user_data.get('is_affiliate'):
            await update.message.reply_text(
                "You need to be an affiliate to access this.\n"
                "Use /affiliate to apply."
            )
            return
        
        stats = await self.db.get_affiliate_stats(user_id)
        
        keyboard = [
            [InlineKeyboardButton("📤 Get Referral Link", callback_data="get_affiliate_link")],
            [InlineKeyboardButton("📊 View Payouts", callback_data="view_payouts")],
            [InlineKeyboardButton("↩️ Back to Menu", callback_data="main_menu")]
        ]
        
        await update.message.reply_text(
            f"💼 *Affiliate Dashboard*\n\n"
            f"Total Referrals: {stats.get('referrals_count', 0)}\n"
            f"Total Earnings: ${stats.get('total_earnings', 0):.2f}\n"
            f"Pending Payouts: ${stats.get('pending_payouts', 0):.2f}\n"
            f"Commission Rate: 15%\n\n"
            "Keep sharing and earning! 💰",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )

# Add callback handlers
def get_monetization_handlers():
    """Get monetization callback handlers"""
    return [
        CallbackQueryHandler(handle_pricing_info, pattern='^pricing_info$'),
        CallbackQueryHandler(handle_how_it_works, pattern='^how_it_works$'),
        CallbackQueryHandler(handle_get_payment_link, pattern='^get_payment_link$'),
        CallbackQueryHandler(handle_share_referral, pattern='^share_referral$'),
        CallbackQueryHandler(handle_view_earnings, pattern='^view_earnings$'),
        CallbackQueryHandler(handle_apply_affiliate, pattern='^apply_affiliate$'),
        CallbackQueryHandler(handle_get_affiliate_link, pattern='^get_affiliate_link$'),
        CallbackQueryHandler(handle_view_payouts, pattern='^view_payouts$'),
    ]