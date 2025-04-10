// src/lib/stores/environment.ts
import { writable } from 'svelte/store';

// Export all types in one consolidated declaration
export interface Branch {
  path: string;
  width: number;
}

export interface Leaf {
  x: number;
  y: number;
  size: number;
}

export interface Particle {
  x: number;
  y: number;
  opacity: number;
  rotation: number;
  speedX: number;
  speedY: number;
}

export interface EnvironmentState {
  treeBranches: Branch[];
  treeLeaves: Leaf[];
  treeOpacity: number;
  shadowLength: number;
  lightIntensity: number;
  dustParticles: Particle[];
}

const initialEnvironment: EnvironmentState = {
  treeBranches: [],
  treeLeaves: [],
  treeOpacity: 0.8,
  shadowLength: 30,
  lightIntensity: 0.3,
  dustParticles: []
};

function generateBranchPath(index: number): string {
  // Implementation that returns an SVG path string
  return \`M50 ${180 - index*2} Q${55 + index} ${150 - index*3} 50 ${120 - index*2}\`;
}

export const environmentStore = writable<EnvironmentState>(initialEnvironment);

const MAX_BRANCHES = 10; // Define a maximum number of branches
const MAX_LEAVES = 15;

export const growTree = () => {
  let grew = false; // Track whether the tree actually grew

  environmentStore.update(env => {
    if (env.treeBranches.length < MAX_BRANCHES || env.treeLeaves.length < MAX_LEAVES) {

      const newBranch: Branch = {
        path: generateBranchPath(env.treeBranches.length),
        width: 1 + Math.random() * 1.5
      };

      const newLeaf: Leaf = {
        x: 40 + Math.random() * 20,
        y: 70 + Math.random() * 50,
        size: 0.5 + Math.random() * 1.5
      };

      grew = true; // Set grew to true if the tree grows

      return {
        ...env,
        treeBranches: [...env.treeBranches.slice(-MAX_BRANCHES + 1), newBranch], // Limit branch count
        treeLeaves: [...env.treeLeaves.slice(-MAX_LEAVES + 1), newLeaf] // Limit leaf count
      };
    } else {
      grew = false; // Set grew to false if the tree didn't grow
      return env; // Return the original state if the tree is at max size
    }
  });

  return grew; // Return whether the tree grew
};

// Function to make the tree decay (lose branches/leaves)
export const decayTree = () => {
  environmentStore.update(env => {
    const branchCount = env.treeBranches.length;
    const leafCount = env.treeLeaves.length;

    if (branchCount === 0 && leafCount === 0) {
      return env; // Nothing to decay
    }

    // Randomly choose whether to remove a branch or a leaf
    if (Math.random() < 0.5 && branchCount > 0) {
      // Remove a branch
      env.treeBranches.pop();
    } else if (leafCount > 0) {
      // Remove a leaf
      env.treeLeaves.pop();
    }

    return { ...env };
  });
};