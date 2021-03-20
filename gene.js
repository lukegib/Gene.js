function getRandomMember(population) {
	const index = getRandomNumberBetween(0, population.length - 1);
	return population[index];
}

// min and max are included
function getRandomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mutate(population, pMutation) {
	for (let i in population) {
		const rand = Math.random();

		// each member has a small chance of being mutated
		if (rand <= pMutation) {
			const member = getRandomMember(population);
			const memberIndex = population.indexOf(member);

			const mutations = getRandomNumberBetween(3, 5); // random amount of bits to change
			let j = 0;

			while (j < mutations) {
				// get random index position
				const mutationIndex = getRandomNumberBetween(0, member.length - 1);

				member[mutationIndex] = member[mutationIndex] == 1 ? 0 : 1;

				j += 1;
			}

			population[memberIndex] = member;
		}
	}

	return population;
}

function crossover(population, pCrossover) {
	// get 20% of population size.. random guys make it straight through
	// the rest go through crossover and are essentially replaced
	const newPopulation = [];

	while (newPopulation.length != population.length) {
		const rand = Math.random();

		if (rand <= pCrossover) {
			const parent1 = getRandomMember(population);
			const parent2 = getRandomMember(population);

			const splitPoint = getRandomNumberBetween(1, population[0].length);

			const start = parent1.slice(0, splitPoint);
			const end = parent2.slice(splitPoint, parent2.length);

			const child = start.concat(end);

			newPopulation.push(child);
		} else {
			const member = getRandomMember(population);
			newPopulation.push(member);
		}
	}

	return newPopulation;
}

function getFitnessValue(member, fitnessType, target, knapsack) {
	let score = 0;

	if (fitnessType === 'knapsack') {
		let weight = 0;

		for (i in member) {
			if (member[i] === 1 && weight + knapsack.weight[i] <= knapsack.size) {
				score += knapsack.value[i];
				weight += knapsack.weight[i];
			}
		}
	} else if (fitnessType === 'target') {
		for (let i = 0; i < target.length; i++) {
			score += member[i] === target[i] ? 1 : 0;
		}
	} else {
		for (let i in member) {
			score += member[i] === 1 ? 1 : 0;
		}
	}

	if (fitnessType === 'deceptive' && score === 0) {
		score = 10 * member.length;
	}

	return score;
}

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

// Return the fittest memebers via Tournament Selection
function getFittest(population, fitnessType, target, knapsack) {
	const fittest = [];

	for (let i = 0; i < population.length; i++) {
		// get random X guys from population
		const noEntrants = getRandomNumberBetween(1, population.length);
		const entrants = [];

		for (let j = 0; j < noEntrants; j++) {
			const member = getRandomMember(population);
			entrants.push(member);
		}

		// select fittest one
		const fittestMember = getFittestMember(entrants, fitnessType, target, knapsack);

		// add them to fittest array
		fittest.push(fittestMember);
	}

	return fittest;
}

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
		// get average fitness of population
		const bestMember = getFittestMember(population, fitnessType, target, knapsack);
		const bestMemberScore = getFitnessValue(bestMember, fitnessType, target, knapsack);
		const averageScore = getAverageFitness(population, fitnessType, target, knapsack);

		data.best.chromosome.push(bestMember);
		data.best.score.push(bestMemberScore);
		data.average.push(averageScore);

		// select fittest members
		population = getFittest(population, fitnessType, target, knapsack);

		// crossover
		population = crossover(population, pCrossover);

		// ... mutation
		population = mutate(population, pMutation);

		generation += 1;
	}

	return data;
}

function createRandomMember(length) {
	let member = [];

	for (let i = 0; i < length; i++) {
		let randGene = Math.random() > 0.5 ? 1 : 0;
		member.push(randGene);
	}

	return member;
}

function initPopulation(size, chromosomeLength) {
	const population = [];
	let newMember;

	for (let i = 0; i < size; i++) {
		newMember = createRandomMember(chromosomeLength);
		population.push(newMember);
	}

	return population;
}

// ************** Implementation for all the above **********************************

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
