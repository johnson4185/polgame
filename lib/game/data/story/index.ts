// Story event registry. Act 1 events come from docs/cjp-timeline.md (see docs/story-brief.md).
import type { StoryEvent } from '../../types';
import { ACT1_MAY, ACT1_JUNE_SEED } from './act1-may';
import { ACT1_OCT } from './act1-oct';

export const STORY_EVENTS: StoryEvent[] = [...ACT1_MAY, ...ACT1_JUNE_SEED, ...ACT1_OCT];

const BY_ID = new Map(STORY_EVENTS.map(e => [e.id, e]));

export function getStoryEvent(id: string): StoryEvent | undefined {
  return BY_ID.get(id);
}
