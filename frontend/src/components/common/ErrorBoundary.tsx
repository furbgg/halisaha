import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
          <style>{`
            .grid-pattern {
                background-image: radial-gradient(circle at 1px 1px, rgba(236, 91, 19, 0.05) 1px, transparent 0);
                background-size: 40px 40px;
            }
            .glass-card {
                background: rgba(34, 22, 16, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(236, 91, 19, 0.2);
            }
            .orange-glow {
                box-shadow: 0 0 20px rgba(236, 91, 19, 0.4);
            }
          `}</style>

          <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden grid-pattern">
            <div className="layout-container flex h-full grow flex-col">
              <main className="flex-1 flex items-center justify-center p-6 relative min-h-screen">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="layout-content-container flex flex-col max-w-[600px] w-full items-center z-10">
                  <div className="glass-card w-full rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    
                    <div className="relative mb-8 group">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 group-hover:bg-primary/30 transition-all"></div>
                      <div className="relative bg-linear-to-br from-primary to-orange-700 w-24 h-32 rounded-xl flex items-center justify-center shadow-2xl rotate-[-5deg]">
                        <span className="material-symbols-outlined text-white text-5xl">warning</span>
                        <div className="absolute -bottom-2 -right-2 bg-background-dark border-2 border-primary rounded-full p-1">
                          <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-6">
                      <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black leading-tight tracking-tight">
                        Hoppla! Ein unerwarteter <span className="text-primary">Fehler</span> ist aufgetreten.
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
                        Unser Team wurde benachrichtigt. Bitte versuchen Sie es in Kürze erneut oder kehren Sie zur Startseite zurück.
                      </p>
                    </div>

                    {import.meta.env.MODE === "development" && (
                      <div className="text-left bg-black/40 p-4 rounded-lg mt-2 mb-8 w-full overflow-auto border border-red-500/30 max-h-32">
                        <p className="text-red-400 font-mono text-xs">{this.state.error?.message}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="orange-glow flex items-center justify-center gap-3 px-8 h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-bold tracking-wide transition-all active:scale-95 group"
                      >
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>ZURÜCK ZUR STARTSEITE</span>
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Seite neu laden
                      </button>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-primary/10 w-full">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500">
                        <span>Fehlercode: 500-SALAMANDA</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          <span>Orange Edition v2.4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
