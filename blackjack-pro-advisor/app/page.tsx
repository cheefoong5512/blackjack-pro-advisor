"use client";

import { useState, useMemo } from "react";

const CARD_OPTIONS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export default function BlackjackAdvisor() {
  const [dealerCard, setDealerCard] = useState<string>("");
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [runningCount, setRunningCount] = useState<number>(0);
  const [decksRemaining, setDecksRemaining] = useState<number>(6);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const getCardValue = (card: string) => {
    if (["2", "3", "4", "5", "6"].includes(card)) return 1;
    if (["10", "J", "Q", "K", "A"].includes(card)) return -1;
    return 0; 
  };

  const trueCount = useMemo(() => {
    if (decksRemaining <= 0) return 0;
    return Math.round((runningCount / decksRemaining) * 10) / 10;
  }, [runningCount, decksRemaining]);

  const handleSetDealerCard = (card: string) => {
    if (dealerCard) setRunningCount((prev) => prev - getCardValue(dealerCard));
    setDealerCard(card);
    setRunningCount((prev) => prev + getCardValue(card));
  };

  const handleAddPlayerCard = (card: string) => {
    setPlayerCards([...playerCards, card]);
    setRunningCount((prev) => prev + getCardValue(card));
  };

  const handleUndoPlayerCard = () => {
    if (playerCards.length === 0) return;
    const lastCard = playerCards[playerCards.length - 1];
    setPlayerCards((prev) => prev.slice(0, -1));
    setRunningCount((prev) => prev - getCardValue(lastCard)); 
  };

  const handleNextRound = () => {
    setPlayerCards([]);
    setDealerCard("");
  };

  const handleResetShoe = () => {
    setPlayerCards([]);
    setDealerCard("");
    setRunningCount(0);
    setDecksRemaining(6);
  };

  const calculateScore = (cards: string[]) => {
    let total = 0;
    let aces = 0;
    cards.forEach((card) => {
      if (["J", "Q", "K"].includes(card)) total += 10;
      else if (card === "A") { total += 11; aces += 1; }
      else total += parseInt(card);
    });
    while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
    return { total, isSoft: aces > 0 };
  };

  const { total: playerTotal, isSoft } = calculateScore(playerCards);

  const advice = useMemo(() => {
    if (!dealerCard || playerCards.length < 2) return "Awaiting Cards...";
    if (playerTotal > 21) return "Bust";
    if (playerTotal === 21 && playerCards.length === 2) return "Blackjack!";
    if (playerTotal === 21) return "Stand";

    const dealerValue = ["J", "Q", "K"].includes(dealerCard) ? 10 : dealerCard === "A" ? 11 : parseInt(dealerCard);

    if (playerCards.length === 2) {
      const card1 = playerCards[0];
      const card2 = playerCards[1];
      const val1 = ["J", "Q", "K"].includes(card1) ? "10" : card1;
      const val2 = ["J", "Q", "K"].includes(card2) ? "10" : card2;

      if (val1 === val2) {
        const pair = val1;
        if (pair === "A" || pair === "8") return "Split";
        if (pair !== "10" && pair !== "5") {
          if (pair === "9" && dealerValue !== 7 && dealerValue <= 9) return "Split";
          if (pair === "7" && dealerValue <= 7) return "Split";
          if (pair === "6" && dealerValue <= 6) return "Split";
          if (pair === "4" && (dealerValue === 5 || dealerValue === 6)) return "Split";
          if ((pair === "2" || pair === "3") && dealerValue <= 7) return "Split";
        }
      }

      if (!isSoft) {
        if (playerTotal === 16 && dealerValue >= 9 && val1 !== "8") return "Surrender (or Hit)";
        if (playerTotal === 15 && dealerValue === 10) return "Surrender (or Hit)";
      }
    }

    if (isSoft) {
      if (playerTotal >= 19) return "Stand";
      if (playerTotal === 18) return dealerValue >= 9 ? "Hit" : "Stand";
      return "Hit"; 
    }

    if (playerTotal >= 17) return "Stand";
    if (playerTotal >= 13 && playerTotal <= 16) return dealerValue <= 6 ? "Stand" : "Hit";
    if (playerTotal === 12) return dealerValue >= 4 && dealerValue <= 6 ? "Stand" : "Hit";
    if (playerTotal === 11) return playerCards.length === 2 ? "Double Down" : "Hit";
    if (playerTotal === 10) return dealerValue <= 9 ? (playerCards.length === 2 ? "Double Down" : "Hit") : "Hit";
    if (playerTotal === 9 && dealerValue >= 3 && dealerValue <= 6) return playerCards.length === 2 ? "Double Down" : "Hit";
    
    return "Hit";
  }, [dealerCard, playerCards, playerTotal, isSoft]);

  // Updated colors to match the greyish theme
  const getAdviceColor = () => {
    if (advice.includes("Awaiting")) return "bg-slate-700 text-slate-300 border-slate-600";
    if (advice.includes("Bust")) return "bg-rose-900/40 text-rose-300 border-rose-700/50";
    if (advice.includes("Stand") || advice.includes("Blackjack")) return "bg-emerald-900/40 text-emerald-300 border-emerald-700/50";
    if (advice.includes("Split") || advice.includes("Double")) return "bg-blue-900/40 text-blue-300 border-blue-700/50";
    if (advice.includes("Surrender")) return "bg-amber-900/40 text-amber-300 border-amber-700/50";
    return "bg-slate-600 text-slate-100 border-slate-500 shadow-sm"; 
  };

  const needsAnotherCard = advice === "Hit" || advice.includes("(or Hit)");

  return (
    <div className="min-h-screen bg-slate-800 text-slate-100 font-sans pb-24 selection:bg-emerald-500/30 relative">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Blackjack Pro
          </h1>
          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Real-Time Strategy Advisor</p>
        </header>

        {/* Dynamic Advice Banner */}
        <div className={`p-6 rounded-2xl border text-center transition-all duration-300 shadow-lg ${getAdviceColor()}`}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Optimal Action</h2>
          <p className="text-4xl md:text-5xl font-black tracking-tight">{advice}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Tracking & Education */}
          <div className="space-y-6">
            
            {/* Card Counter Dashboard */}
            <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Hi-Lo Tracker</h2>
                  <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="w-5 h-5 rounded-full bg-slate-600 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-500 hover:text-white transition-colors border border-slate-500"
                  >
                    ?
                  </button>
                </div>
                <button onClick={handleResetShoe} className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 border border-slate-500 px-3 py-1.5 rounded-full transition-colors font-semibold">
                  Reset Shoe
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Running</div>
                  <div className="text-2xl font-bold text-slate-100">{runningCount}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 flex flex-col items-center justify-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Decks</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDecksRemaining(prev => Math.max(0.5, prev - 0.5))} className="text-slate-400 hover:text-slate-200 transition-colors font-bold">-</button>
                    <span className="text-lg font-bold text-slate-100 w-6">{decksRemaining}</span>
                    <button onClick={() => setDecksRemaining(prev => prev + 0.5)} className="text-slate-400 hover:text-slate-200 transition-colors font-bold">+</button>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-colors ${trueCount >= 2 ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400' : trueCount < 0 ? 'bg-rose-900/30 border-rose-700/50 text-rose-400' : 'bg-slate-800/50 border-slate-600/50 text-slate-200'}`}>
                  <div className="text-[10px] uppercase tracking-wider mb-1 opacity-80">True Count</div>
                  <div className="text-2xl font-black">{trueCount}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-slate-400 text-center font-semibold">Quick Adjust (Other Players)</div>
                <div className="flex gap-2">
                  <button onClick={() => setRunningCount(prev => prev + 1)} className="bg-slate-600 hover:bg-slate-500 border border-slate-500 text-slate-100 py-2.5 rounded-lg font-bold flex-1 text-sm transition-colors active:scale-95 shadow-sm">+1 <span className="text-slate-300 text-xs ml-1 font-normal">(2-6)</span></button>
                  <button onClick={() => setRunningCount(prev => prev - 1)} className="bg-slate-600 hover:bg-slate-500 border border-slate-500 text-slate-100 py-2.5 rounded-lg font-bold flex-1 text-sm transition-colors active:scale-95 shadow-sm">-1 <span className="text-slate-300 text-xs ml-1 font-normal">(10-A)</span></button>
                </div>
              </div>
            </section>

            {/* Deck Estimation & Online Warning */}
            <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-lg space-y-4">
              {/* Online Casino Warning */}
              <div className="bg-amber-900/20 border border-amber-700/50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-1">
                  ⚠️ Playing Online? Read This.
                </h4>
                <div className="text-xs text-amber-200/80 space-y-2">
                  <p>Card counting does <strong>not work</strong> in online casinos:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Digital/RNG Games:</strong> The virtual deck is fully shuffled after every single hand. The count resets immediately.</li>
                    <li><strong>Live Dealers:</strong> They usually cut the shoe at 50% or use Continuous Shuffling Machines (CSMs). You will never reach a mathematically profitable True Count.</li>
                  </ul>
                  <p className="font-semibold mt-2 text-amber-300">Only rely on the "Optimal Action" Basic Strategy above when playing online!</p>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: The Hand Inputs */}
          <div className="space-y-6">
            <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-lg">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Dealer Upcard</h2>
              <div className="flex flex-wrap gap-2">
                {CARD_OPTIONS.map((card) => (
                  <button
                    key={`dealer-${card}`}
                    onClick={() => handleSetDealerCard(card)}
                    className={`w-11 h-16 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 active:scale-95 ${
                      dealerCard === card 
                        ? "bg-slate-100 text-slate-900 shadow-md ring-2 ring-slate-300 ring-offset-2 ring-offset-slate-700" 
                        : "bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500 shadow-sm"
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </section>

            <section className={`bg-slate-700 rounded-2xl p-6 shadow-lg transition-colors duration-500 border ${needsAnotherCard ? "border-emerald-500/50 ring-2 ring-emerald-500/20" : "border-slate-600"}`}>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Hand</h2>
                  <div className="text-2xl font-black mt-1 text-slate-100">{playerTotal} <span className="text-sm font-medium text-slate-400 ml-1">{isSoft ? "(Soft)" : ""}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUndoPlayerCard} disabled={playerCards.length === 0} className="text-xs bg-slate-600 hover:bg-slate-500 border border-slate-500 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-full transition-colors font-semibold">
                    Undo
                  </button>
                  <button onClick={handleNextRound} className="text-xs bg-slate-100 hover:bg-white text-slate-900 px-3 py-1.5 rounded-full transition-colors font-bold shadow-sm">
                    Next Hand
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6 min-h-[4.5rem] p-3 bg-slate-800/50 rounded-xl border border-slate-600/50">
                {playerCards.length === 0 && <span className="text-slate-500 text-sm font-medium flex items-center justify-center w-full">Select cards below...</span>}
                {playerCards.map((card, idx) => (
                  <div key={idx} className="w-12 h-16 bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm animate-in fade-in zoom-in duration-200">
                    {card}
                  </div>
                ))}
              </div>

              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 transition-colors ${needsAnotherCard ? "text-emerald-400 animate-pulse" : "text-slate-400"}`}>
                {playerCards.length >= 2 && needsAnotherCard ? "Dealt another card? Add it here:" : "Select your cards:"}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {CARD_OPTIONS.map((card) => (
                  <button
                    key={`player-${card}`}
                    onClick={() => handleAddPlayerCard(card)}
                    className={`w-11 h-16 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 active:scale-95 shadow-sm ${
                      needsAnotherCard
                        ? "bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/50 border border-emerald-700/50"
                        : "bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500"
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- Help Modal / Popup --- */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-700 border border-slate-600 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-600 hover:bg-slate-500 font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-extrabold text-slate-100 mb-4">How to use the Tracker</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>This app uses the standard <strong>Hi-Lo Card Counting system</strong>.</p>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-600/50 pb-2">
                  <span className="text-blue-400 font-bold">Low Cards (2-6)</span>
                  <span className="bg-slate-600 border border-slate-500 px-2 py-1 rounded text-slate-200 font-mono shadow-sm">+1</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600/50 pb-2">
                  <span className="text-slate-400 font-bold">Neutral (7-9)</span>
                  <span className="bg-slate-600 border border-slate-500 px-2 py-1 rounded text-slate-200 font-mono shadow-sm">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-400 font-bold">High Cards (10-A)</span>
                  <span className="bg-slate-600 border border-slate-500 px-2 py-1 rounded text-slate-200 font-mono shadow-sm">-1</span>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><strong className="text-slate-100">Auto-Tracking:</strong> The app counts the cards you click for your hand and the dealer's hand.</li>
                <li><strong className="text-slate-100">Quick Adjust:</strong> Use the +1 and -1 buttons to manually log cards dealt to <em>other players</em>.</li>
                <li><strong className="text-slate-100">True Count:</strong> A True Count of <span className="text-emerald-400 font-bold">+2 or higher</span> means the deck is rich in high cards!</li>
              </ul>
            </div>
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-6 bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded-xl transition-colors shadow-md"
            >
              Got it, let's play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}