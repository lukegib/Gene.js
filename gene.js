/* All functions needed to run a Genetic Algorithm */

// Generates a number between a min and max, which are both included
function getRandomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns a random member from the population
function getRandomMember(population) {
	const index = getRandomNumberBetween(0, population.length - 1);
	return population[index];
}

// Mutation - used to increase diversity in the population
function mutate(population, pMutation) {
	for (let i in population) {
		const rand = Math.random();

		// Each member of the population has a (usually small) chance of being mutated
		if (rand <= pMutation) {
			const member = getRandomMember(population);
			const memberIndex = population.indexOf(member);

			// Will flip 3-5 of its bits
			const mutations = getRandomNumberBetween(3, 5);
			let j = 0;

			while (j < mutations) {
				// Get a random bit to change and...
				const mutationIndex = getRandomNumberBetween(0, member.length - 1);

				// Flip it!
				member[mutationIndex] = member[mutationIndex] == 1 ? 0 : 1;

				j += 1;
			}

			population[memberIndex] = member;
		}
	}

	return population;
}

// Crossover - combines two members to create a new child
function crossover(population, pCrossover) {
	const newPopulation = [];

	while (newPopulation.length != population.length) {
		const rand = Math.random();

		// Crossover comes with a (usually high) probability
		if (rand <= pCrossover) {
			// Get two random members
			const parent1 = getRandomMember(population);
			const parent2 = getRandomMember(population);

			// Find a point to split them
			const splitPoint = getRandomNumberBetween(1, population[0].length);

			// Take the start of the split point from parent 1 and...
			const start = parent1.slice(0, splitPoint);
			// Take the end of it from parent 2
			const end = parent2.slice(splitPoint, parent2.length);

			// Combine them to create the new child
			const child = start.concat(end);

			newPopulation.push(child);
		} else {
			// On the chance crossover doesn't occur, a random member moves straight into the next generation
			const member = getRandomMember(population);
			newPopulation.push(member);
		}
	}

	return newPopulation;
}

// Returns the fitness value of a member
function getFitnessValue(member, fitnessType, target, knapsack) {
	let score = 0;

	// For the knapsack problem
	if (fitnessType === 'knapsack') {
		let weight = 0;

		// For each gene...
		for (i in member) {
			// If we hit a 1 and adding it won't exceed the knapsack weight cap - Add it!
			if (member[i] === 1 && weight + knapsack.weight[i] <= knapsack.size) {
				score += knapsack.value[i];
				weight += knapsack.weight[i];
			}
		}
	} else if (fitnessType === 'target') {
		// For target fitness, if the bit matches the target +1 to score
		for (let i = 0; i < target.length; i++) {
			score += member[i] === target[i] ? 1 : 0;
		}
	} else {
		// For one-max (and deceptive), if a gene is a 1 then +1 to score
		for (let i in member) {
			score += member[i] === 1 ? 1 : 0;
		}
	}

	// The deceptive fitness will give a large score to poor (all zeros) members
	if (fitnessType === 'deceptive' && score === 0) {
		score = 2 * member.length;
	}

	return score;
}

// Returns the average fitness score of the population
function getAverageFitness(population, fitnessType, target, knapsack) {
	let average = 0;

	for (let i in population) {
		average += getFitnessValue(population[i], fitnessType, target, knapsack);
	}

	return average / population.length;
}

// Finds the fittest individual from a population
function getFittestMember(population, fitnessType, target, knapsack) {
	let fittestMember = population[0];

	for (let i = 1; i < population.length; i++) {
		if (
			getFitnessValue(fittestMember, fitnessType, target, knapsack) <
			getFitnessValue(population[i], fitnessType, target, knapsack)
		) {
			fittestMember = population[i];
		}
	}

	return fittestMember;
}

// Returns the fittest members via tournament selection
function getFittest(population, fitnessType, target, knapsack) {
	const fittest = [];

	for (let i = 0; i < population.length; i++) {
		const noEntrants = getRandomNumberBetween(1, population.length);
		const entrants = [];

		// get random X guys from population
		for (let j = 0; j < noEntrants; j++) {
			const member = getRandomMember(population);
			entrants.push(member);
		}

		// Find the fittest one
		const fittestMember = getFittestMember(entrants, fitnessType, target, knapsack);

		fittest.push(fittestMember);
	}

	return fittest;
}

// Calls all the processes above...
function startEvolution(
	startPopulation,
	maxGenerations,
	fitnessType,
	pCrossover,
	pMutation,
	target,
	knapsack
) {
	let data = {
		best: {
			chromosome: [],
			score: [],
		},
		average: [],
	};
	let population = startPopulation;
	let generation = 0;

	while (generation < maxGenerations) {
		// Get average/best fitness of population
		const bestMember = getFittestMember(population, fitnessType, target, knapsack);
		const bestMemberScore = getFitnessValue(bestMember, fitnessType, target, knapsack);
		const averageScore = getAverageFitness(population, fitnessType, target, knapsack);

		data.best.chromosome.push(bestMember);
		data.best.score.push(bestMemberScore);
		data.average.push(averageScore);

		// Let the population be the fittest members
		population = getFittest(population, fitnessType, target, knapsack);

		population = crossover(population, pCrossover);

		population = mutate(population, pMutation);

		generation += 1;
	}

	return data;
}

// Generates a random bit array
function createRandomMember(length) {
	let member = [];

	for (let i = 0; i < length; i++) {
		let randGene = Math.random() > 0.5 ? 1 : 0;
		member.push(randGene);
	}

	return member;
}

// Creates an array of bit arrays
function initPopulation(size, chromosomeLength) {
	const population = [];
	let newMember;

	for (let i = 0; i < size; i++) {
		newMember = createRandomMember(chromosomeLength);
		population.push(newMember);
	}

	return population;
}

// Puts all the above functions into effect
const GeneticAlgorithm = (
	populationSize,
	chromosomeLength,
	maxGenerations,
	pCrossover,
	pMutation,
	fitnessType,
	target = [],
	knapsack = {}
) => {
	const population = initPopulation(populationSize, chromosomeLength);

	return startEvolution(
		population,
		maxGenerations,
		fitnessType,
		pCrossover,
		pMutation,
		target,
		knapsack
	);
};
