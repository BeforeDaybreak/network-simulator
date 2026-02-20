import { useStore } from '../../store';
import { useSimulation } from '../../hooks/use-simulation';
import { SCENARIOS, createPingScenario, createHttpScenario, createDnsScenario } from '../../engine/scenarios';
import type { ScenarioType } from '../../engine/scenarios';

export default function SimulationToolbar() {
  const nodes = useStore((s) => s.nodes);
  const simState = useStore((s) => s.simState);
  const speed = useStore((s) => s.speed);
  const setSpeed = useStore((s) => s.setSpeed);
  const enqueueEvent = useStore((s) => s.enqueueEvent);
  const eventQueue = useStore((s) => s.eventQueue);

  const { start, pause, resume, stepOnce, reset } = useSimulation();

  const launchScenario = (scenarioId: ScenarioType) => {
    const hosts = nodes.filter((n) => n.type === 'host');
    const webServers = nodes.filter((n) => n.type === 'web-server');
    const dnsServers = nodes.filter((n) => n.type === 'dns-server');

    let events: ReturnType<typeof createPingScenario> = [];

    if (scenarioId === 'ping') {
      if (hosts.length < 2) {
        // Try host → any other node
        const src = hosts[0];
        const dst = nodes.find((n) => n.id !== src?.id && n.type !== 'switch');
        if (src && dst) events = createPingScenario(src, dst);
      } else {
        events = createPingScenario(hosts[0], hosts[1]);
      }
    } else if (scenarioId === 'http-request') {
      const src = hosts[0];
      const dst = webServers[0];
      if (src && dst) events = createHttpScenario(src, dst);
    } else if (scenarioId === 'dns-lookup') {
      const src = hosts[0];
      const dns = dnsServers[0];
      if (src && dns) events = createDnsScenario(src, dns);
    }

    if (events.length === 0) return;

    reset();
    for (const event of events) {
      enqueueEvent(event);
    }
  };

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3">
      {/* Scenarios */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase font-semibold">Scenario:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => launchScenario(s.id)}
            disabled={nodes.length < 2}
            className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700
                       border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={s.description}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {simState === 'idle' || simState === 'paused' ? (
          <button
            onClick={eventQueue.length > 0 ? (simState === 'paused' ? resume : start) : undefined}
            disabled={eventQueue.length === 0}
            className="px-3 py-1 text-xs rounded-md bg-green-800 text-green-200 hover:bg-green-700
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-3 py-1 text-xs rounded-md bg-yellow-800 text-yellow-200 hover:bg-yellow-700 transition-colors"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={stepOnce}
          disabled={eventQueue.length === 0 && simState !== 'paused'}
          className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700
                     border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ⏭ Step
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700
                     border border-gray-700 transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Speed:</span>
        {[0.5, 1, 2, 4].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 text-xs rounded ${
              speed === s
                ? 'bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } transition-colors`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Save/Load */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => useStore.getState().saveToStorage()}
          disabled={nodes.length === 0}
          className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700
                     border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => useStore.getState().loadFromStorage()}
          className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700
                     border border-gray-700 transition-colors"
        >
          Load
        </button>
      </div>

      {/* Status */}
      <div className="ml-auto flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            simState === 'running'
              ? 'bg-green-400 animate-pulse'
              : simState === 'paused'
              ? 'bg-yellow-400'
              : 'bg-gray-600'
          }`}
        />
        <span className="text-xs text-gray-400 uppercase">{simState}</span>
        {eventQueue.length > 0 && (
          <span className="text-xs text-gray-500">({eventQueue.length} events queued)</span>
        )}
      </div>
    </div>
  );
}
