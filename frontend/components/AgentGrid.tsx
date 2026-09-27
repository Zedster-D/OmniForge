'use client';

import React from 'react';
import { AgentStream } from './AgentStream';
import { AgentLiveState } from '../hooks/useTelemetry';

interface AgentGridProps {
  casualState: AgentLiveState;
  speedrunnerState: AgentLiveState;
  explorerState: AgentLiveState;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  casualState,
  speedrunnerState,
  explorerState,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Casual Agent Terminal */}
      <AgentStream
        agentId="casual"
        name="Casual"
        executableName="CASUAL.EXE"
        room={casualState.room}
        playerHp={casualState.player_hp}
        maxPlayerHp={casualState.max_player_hp}
        frustration={casualState.frustration}
        isFinished={casualState.is_finished}
        events={casualState.recent_events}
        themeColor="cyan"
      />

      {/* 2. Speedrunner Agent Terminal */}
      <AgentStream
        agentId="speedrunner"
        name="Speedrunner"
        executableName="SPEEDRUN.EXE"
        room={speedrunnerState.room}
        playerHp={speedrunnerState.player_hp}
        maxPlayerHp={speedrunnerState.max_player_hp}
        frustration={speedrunnerState.frustration}
        isFinished={speedrunnerState.is_finished}
        events={speedrunnerState.recent_events}
        themeColor="purple"
      />

      {/* 3. Explorer Agent Terminal */}
      <AgentStream
        agentId="explorer"
        name="Explorer"
        executableName="EXPLORER.EXE"
        room={explorerState.room}
        playerHp={explorerState.player_hp}
        maxPlayerHp={explorerState.max_player_hp}
        frustration={explorerState.frustration}
        isFinished={explorerState.is_finished}
        events={explorerState.recent_events}
        themeColor="emerald"
      />
    </div>
  );
};
