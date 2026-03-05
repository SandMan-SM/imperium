# courses defined as per debrief.md

PHASES = {
    1: {
        "title": "IGNITION",
        "description": "Phase I: The foundation of purpose and rebirth.",
        "units": {
            1: {
                "title": "The Power of Purpose",
                "content": "1. Being open-minded\n2. The 5 Faces of Purpose: Service, Creation, Knowledge, Growth, Legacy\n3. Understanding your 'why'\n4. The importance of a purpose statement"
            },
            2: {
                "title": "The Rising (Rebirth)",
                "content": "1. Forget what you know\n2. Identity\n3. Affirmations"
            },
            3: {
                "title": "The Three Currencies of Life",
                "content": "1. Time | Money | Knowledge\n2. How to leverage the three currencies\n3. Where to find knowledge"
            }
        }
    },
    2: {
        "title": "FOUNDATION",
        "description": "Phase II: Building the mind and absolute ownership.",
        "units": {
            4: {"title": "The Mind is Everything", "content": "1. Preservation of energy\n2. The chains of habit\n3. A man doesn’t fall to the level of his goals..."},
            5: {"title": "Chaos to Power", "content": "1. Motivation → Discipline → Habit\n2. How this builds discipline\n3. The power of identity association"},
            6: {"title": "Absolute Ownership", "content": "1. The intelligence trap\n2. Taking responsibility\n3. The art of hustling"},
            7: {"title": "Continuous Growth", "content": "1. 1% better each day\n2. Long-term exposure\n3. Permanent relationships\n4. Mind, body, and spirit\n5. Compound growth (Investing)\n6. Warren Buffett’s $30 → $10K principle"},
            8: {"title": "The Price of Ambition", "content": "1. Fostering positive ambition through purpose\n2. Sacrifice and obedience"},
            9: {"title": "Unbreakable Confidence", "content": "1. Delusional belief in your own capabilities\n2. Build confidence through action"},
            10: {"title": "Mastering Awareness", "content": "1. Practice makes perfect\n2. Flow state (Thoth)\n3. Everything you need is already around you\n4. Perspective vs perception"},
            11: {"title": "Emotional Sovereignty", "content": "1. Turn emotions into productive actions aligned with your goals\n2. Emotional intelligence\n3. Detachment\n4. Self-awareness: knowing your triggers and patterns"},
            12: {"title": "The Power of Gratitude", "content": "1. Adopting a positive mindset"}
        }
    },
    3: {
        "title": "EXPANSION",
        "description": "Phase III: The builder's mindset and the law of leverage.",
        "units": {
            13: {"title": "The Builder’s Mindset", "content": "1. Definition of luck\n2. Building foundations\n3. Bringing people up with you (crabs in the bucket)"},
            14: {"title": "The Law of Attraction", "content": "1. People love confidence\n2. The lure of mystery\n3. The abundance mindset"},
            15: {"title": "The Law of Leverage", "content": "1. Risk and reward\n2. The butterfly effect\n3. The power of momentum\n4. Make your money work for you"},
            16: {"title": "The Inner Circle", "content": "1. The principle of proximity\n2. Explosive growth (Bulgarian horses)"}
        }
    },
    4: {
        "title": "MASTERY",
        "description": "Phase IV: Strategy, enlightenment, and the art of war.",
        "units": {
            17: {"title": "Strategy", "content": "1. Using these strategies as your tools"},
            18: {"title": "The Secret", "content": "1. Making people feel exclusive"},
            19: {"title": "SPIN Selling", "content": "1. Get information\n2. Make it obvious\n3. Get commitment\n4. AIWOL effect"},
            20: {"title": "Principle of Reciprocity", "content": "1. Give and they give back"},
            21: {"title": "Strategic Silence", "content": "1. Choosing to speak is an action\n2. The power of saying no"},
            22: {"title": "The Mask", "content": "1. Public, private, and secret life"},
            23: {"title": "The Art of War", "content": "1. TAO\n2. Generals\n3. Recruiting to your cause\n4. Leadership"},
            24: {"title": "The Alchemist", "content": "1. Sweet, cunning, and ruthless\n2. Luck and coincidences\n3. Moving with the universe"},
            25: {"title": "Enlightenment", "content": "1. Inner peace through love and knowledge\n2. Connection with source\n3. Ascended teachings (Buddha)"}
        }
    },
    5: {
        "title": "LEGACY",
        "description": "Phase V: What you build when you're gone.",
        "units": {
            26: {"title": "While You’re Here", "content": "1. What do you want to be remembered for when you’re gone?\n2. Don’t wait for change—make it happen\n3. Leverage through life insurance\n4. The power of investing now"},
            27: {"title": "When You’re Gone", "content": "1. Setting up your trust\n2. AGI legacy model"},
            28: {"title": "The Mentor", "content": "1. “If you want to make money, grow rice. If you want to create generational wealth, grow people.”\n2. Time to teach what you’ve learned"}
        }
    }
}

TOTAL_UNITS = 28

def get_unit_details(unit_id: int):
    for phase_id, phase_data in PHASES.items():
        if unit_id in phase_data["units"]:
            return phase_id, phase_data["units"][unit_id]
    return None, None
