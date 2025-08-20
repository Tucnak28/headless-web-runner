// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LoadingBotCard({ id: _id }: { id: string }) {
  return (
    <div className="relative w-full">
      <div className="glass-card p-6 w-full space-y-5 animate-pulse">
        
        {/* Header with Bot ID */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse">
            </div>
            <div>
              <h3 className="font-semibold text-gray-300">New Bot</h3>
              <p className="text-xs text-gray-500">Creating...</p>
            </div>
          </div>
          
          {/* Loading Badge */}
          <div className="status-badge status-loading">
            🔄 LOADING
          </div>
        </div>

        {/* Loading skeleton for inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="h-16 bg-gray-700/30 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-700/30 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading skeleton for buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-gray-700/30 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-gray-700/30 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 rounded border border-gray-700/50">
          <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
          <span className="text-gray-300">Creating bot...</span>
        </div>
      </div>
    </div>
  );
}