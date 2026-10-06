// Story event registry. Act 1 events come from docs/cjp-timeline.md (see docs/story-brief.md).
import type { StoryEvent } from '../../types';
import { ACT1_MAY } from './act1-may';
import { ACT1_JUN } from './act1-jun';
import { ACT1_JUL } from './act1-jul';
import { ACT1_AUG, ACT1_SEP } from './act1-aug-sep';
import { ACT1_OCT } from './act1-oct';

export const STORY_EVENTS: StoryEvent[] = [...ACT1_MAY, ...ACT1_JUN, ...ACT1_JUL, ...ACT1_AUG, ...ACT1_SEP, ...ACT1_OCT];

const BY_ID = new Map(STORY_EVENTS.map(e => [e.id, e]));

export function getStoryEvent(id: string): StoryEvent | undefined {
  return BY_ID.get(id);
}
