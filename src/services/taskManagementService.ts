/**
 * USER TASK MANAGEMENT SERVICE (src/services/taskManagementService.ts)
 * 
 * Implements ISO 9241-110:2020 Ergonomics of Human-System Interaction
 * Principle 1: "Suitability for the Task" - Prioritizing user-defined outcomes
 * over low-level technical operations.
 */

export interface UserTask {
  id: string;
  title: string;
  description: string;
  category: 'ai_workflow' | 'document' | 'file_organization' | 'legal' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  aiActionPrompt?: string; // Pre-configured prompt for 1-click AI execution
  associatedFileId?: string;
}

export class TaskManagementService {
  private static instance: TaskManagementService | null = null;
  private tasks: UserTask[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadTasks();
  }

  public static getInstance(): TaskManagementService {
    if (!TaskManagementService.instance) {
      TaskManagementService.instance = new TaskManagementService();
    }
    return TaskManagementService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) {
      try {
        l();
      } catch (e) {
        console.error('[TaskManagement] Listener error:', e);
      }
    }
  }

  private loadTasks(): void {
    const saved = localStorage.getItem('serverspace_user_tasks');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
        return;
      } catch {
        // Fall through to initial seeds
      }
    }

    // Initial user-oriented tasks
    this.tasks = [
      {
        id: 'task-1',
        title: 'Review and Execute Mutual NDA with Partner',
        description: 'Review the 5-year confidentiality clauses and sign the mutual non-disclosure agreement in Legal Matters.',
        category: 'legal',
        priority: 'high',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        dueDate: 'Today',
        aiActionPrompt: 'Draft an executive clause summary of the Mutual Non-Disclosure Agreement highlighting trade secret definitions.'
      },
      {
        id: 'task-2',
        title: 'Synthesize Q3 Financial Projections & Margins',
        description: 'Ask AI assistant to analyze the Q3 spreadsheet numbers and generate an executive summary document.',
        category: 'ai_workflow',
        priority: 'high',
        status: 'todo',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        dueDate: 'Tomorrow',
        aiActionPrompt: 'Analyze Q3 Financial Projections spreadsheet and summarize gross margin trends.'
      },
      {
        id: 'task-3',
        title: 'Organize Project Architecture & System Diagrams',
        description: 'Group vector SVG diagrams and engineering specifications into the Work Projects folder.',
        category: 'file_organization',
        priority: 'medium',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        dueDate: 'Completed'
      },
      {
        id: 'task-4',
        title: 'Draft Project Architecture Technical Specification',
        description: 'Create an engineering specification document outlining workspace pipelines and background maintenance.',
        category: 'document',
        priority: 'medium',
        status: 'todo',
        createdAt: new Date().toISOString(),
        dueDate: 'Friday',
        aiActionPrompt: 'Draft an engineering technical specification for a high-assurance hybrid storage workspace.'
      }
    ];
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem('serverspace_user_tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.error('[TaskManagement] Save error:', e);
    }
    this.notify();
  }

  public getTasks(): UserTask[] {
    return [...this.tasks];
  }

  public addTask(task: Omit<UserTask, 'id' | 'createdAt'>): UserTask {
    const newTask: UserTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks = [newTask, ...this.tasks];
    this.save();
    return newTask;
  }

  public toggleTaskStatus(taskId: string): void {
    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    this.save();
  }

  public updateTask(taskId: string, updates: Partial<UserTask>): void {
    this.tasks = this.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    this.save();
  }

  public deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.save();
  }
}

export const GLOBAL_TASK_MANAGEMENT = TaskManagementService.getInstance();
