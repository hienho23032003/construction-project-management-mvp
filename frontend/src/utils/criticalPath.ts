import { parseISO, differenceInDays } from 'date-fns';
import { GanttTask, GanttLink } from '../types';

export interface CriticalPathResult {
  criticalTaskIds: Set<string>;
  criticalLinkIds: Set<string>;
  totalCriticalDurationDays: number;
}

/**
 * Calculates the Critical Path Method (CPM) accurately for Gantt tasks and dependency links.
 * 1. Isolates CPM calculation per project (so different projects with different durations don't skew float).
 * 2. Evaluates the dependency network strictly on leaf work items (actionable tasks).
 * 3. Considers scheduled calendar dates in combination with precedence logic for ES/EF and LS/LF.
 * 4. Identifies critical links where zero-slack handover occurs (Successor starts right after Predecessor).
 * 5. Cascades critical status up to parent phases/projects so they reflect critical status if they contain critical work.
 */
export const calculateCriticalPath = (
  tasks: GanttTask[],
  links: GanttLink[] = []
): CriticalPathResult => {
  const criticalTaskIds = new Set<string>();
  const criticalLinkIds = new Set<string>();

  if (!tasks || tasks.length === 0) {
    return { criticalTaskIds, criticalLinkIds, totalCriticalDurationDays: 0 };
  }

  // Identify parent containers vs leaf tasks
  const parentIds = new Set<string>();
  tasks.forEach((t) => {
    if (t.parentId) parentIds.add(t.parentId);
  });

  const taskById = new Map<string, GanttTask>();
  tasks.forEach((t) => taskById.set(t.id, t));

  // Group tasks by project
  const projectTasksMap = new Map<string, GanttTask[]>();
  tasks.forEach((t) => {
    const pId = t.projectId || t.projectCode || 'DEFAULT_PROJECT';
    const list = projectTasksMap.get(pId) || [];
    list.push(t);
    projectTasksMap.set(pId, list);
  });

  let maxTotalDuration = 0;

  // Process CPM for each project independently
  projectTasksMap.forEach((pTasks) => {
    // Only analyze leaf tasks (actionable work items)
    const leafTasks = pTasks.filter(
      (t) => t.type !== 'project' && t.type !== 'phase' && !parentIds.has(t.id)
    );

    if (leafTasks.length === 0) {
      pTasks.forEach((t) => {
        if (t.type !== 'project') leafTasks.push(t);
      });
    }

    if (leafTasks.length === 0) return;

    const taskMap = new Map<string, GanttTask>();
    leafTasks.forEach((t) => taskMap.set(t.id, t));

    // Find project min start date across leaf tasks
    let projectMinStart = parseISO(leafTasks[0].start);
    leafTasks.forEach((t) => {
      try {
        const s = parseISO(t.start);
        if (s < projectMinStart) projectMinStart = s;
      } catch {
        // ignore
      }
    });

    // Durations & Scheduled Starts (relative to project min start in days)
    const taskDuration = new Map<string, number>();
    const scheduledStart = new Map<string, number>();

    leafTasks.forEach((t) => {
      try {
        const s = parseISO(t.start);
        const e = parseISO(t.end);
        const dur = Math.max(1, differenceInDays(e, s) + 1);
        const sStart = Math.max(0, differenceInDays(s, projectMinStart));
        taskDuration.set(t.id, dur);
        scheduledStart.set(t.id, sStart);
      } catch {
        taskDuration.set(t.id, 1);
        scheduledStart.set(t.id, 0);
      }
    });

    // Filter relevant links between these leaf tasks
    const relevantLinks = links.filter(
      (l) => taskMap.has(l.source) && taskMap.has(l.target)
    );

    // Build predecessor and successor graphs
    const successors = new Map<string, { targetId: string; linkId: string }[]>();
    const predecessors = new Map<string, { sourceId: string; linkId: string }[]>();

    leafTasks.forEach((t) => {
      successors.set(t.id, []);
      predecessors.set(t.id, []);
    });

    relevantLinks.forEach((l) => {
      successors.get(l.source)?.push({ targetId: l.target, linkId: l.id });
      predecessors.get(l.target)?.push({ sourceId: l.source, linkId: l.id });
    });

    // Forward Pass: ES (Early Start) and EF (Early Finish)
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();

    const memoES = (taskId: string, visited: Set<string> = new Set()): number => {
      if (earlyStart.has(taskId)) return earlyStart.get(taskId)!;
      if (visited.has(taskId)) return scheduledStart.get(taskId) ?? 0;
      visited.add(taskId);

      const preds = predecessors.get(taskId) || [];
      const sched = scheduledStart.get(taskId) ?? 0;
      let maxPredFinish = sched;

      for (const p of preds) {
        const pFinish = memoEF(p.sourceId, new Set(visited));
        if (pFinish > maxPredFinish) {
          maxPredFinish = pFinish;
        }
      }

      earlyStart.set(taskId, maxPredFinish);
      return maxPredFinish;
    };

    const memoEF = (taskId: string, visited: Set<string> = new Set()): number => {
      if (earlyFinish.has(taskId)) return earlyFinish.get(taskId)!;
      const es = memoES(taskId, visited);
      const dur = taskDuration.get(taskId) || 1;
      const ef = es + dur;
      earlyFinish.set(taskId, ef);
      return ef;
    };

    leafTasks.forEach((t) => memoEF(t.id));

    let maxProjFinish = 0;
    leafTasks.forEach((t) => {
      const ef = earlyFinish.get(t.id) || 0;
      if (ef > maxProjFinish) maxProjFinish = ef;
    });

    if (maxProjFinish > maxTotalDuration) {
      maxTotalDuration = maxProjFinish;
    }

    // Backward Pass: LF (Late Finish) and LS (Late Start)
    const lateFinish = new Map<string, number>();
    const lateStart = new Map<string, number>();

    const memoLF = (taskId: string, visited: Set<string> = new Set()): number => {
      if (lateFinish.has(taskId)) return lateFinish.get(taskId)!;
      if (visited.has(taskId)) return maxProjFinish;
      visited.add(taskId);

      const succs = successors.get(taskId) || [];
      if (succs.length === 0) {
        lateFinish.set(taskId, maxProjFinish);
        return maxProjFinish;
      }

      let minSuccStart = Infinity;
      for (const s of succs) {
        const sStart = memoLS(s.targetId, new Set(visited));
        if (sStart < minSuccStart) {
          minSuccStart = sStart;
        }
      }

      const lf = minSuccStart === Infinity ? maxProjFinish : minSuccStart;
      lateFinish.set(taskId, lf);
      return lf;
    };

    const memoLS = (taskId: string, visited: Set<string> = new Set()): number => {
      if (lateStart.has(taskId)) return lateStart.get(taskId)!;
      const lf = memoLF(taskId, visited);
      const dur = taskDuration.get(taskId) || 1;
      const ls = lf - dur;
      lateStart.set(taskId, ls);
      return ls;
    };

    leafTasks.forEach((t) => memoLS(t.id));

    // Identify Critical Tasks: Total Float = LS - ES == 0
    const projectCriticalLeaves = new Set<string>();
    leafTasks.forEach((t) => {
      const es = earlyStart.get(t.id) ?? 0;
      const ls = lateStart.get(t.id) ?? 0;
      const float = ls - es;
      if (Math.abs(float) <= 0.001) {
        projectCriticalLeaves.add(t.id);
        criticalTaskIds.add(t.id);
      }
    });

    // Identify Critical Links: both ends are critical and target starts right when source finishes
    relevantLinks.forEach((l) => {
      if (projectCriticalLeaves.has(l.source) && projectCriticalLeaves.has(l.target)) {
        const sourceEF = earlyFinish.get(l.source);
        const targetES = earlyStart.get(l.target);
        if (sourceEF !== undefined && targetES !== undefined) {
          if (Math.abs(targetES - sourceEF) <= 1) {
            criticalLinkIds.add(l.id);
          }
        }
      }
    });
  });

  // Cascade critical status up to parents (Phase / Project)
  const markParents = (childId: string) => {
    const child = taskById.get(childId);
    if (child && child.parentId && taskById.has(child.parentId)) {
      criticalTaskIds.add(child.parentId);
      markParents(child.parentId);
    }
  };

  Array.from(criticalTaskIds).forEach((id) => markParents(id));

  return {
    criticalTaskIds,
    criticalLinkIds,
    totalCriticalDurationDays: maxTotalDuration,
  };
};
