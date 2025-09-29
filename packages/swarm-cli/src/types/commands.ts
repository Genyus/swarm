import { IFeatureGenerator, NodeGenerator } from '@ingenyus/swarm-core';

/**
 * Interface for base generator commands
 * @interface IBaseGeneratorCommand
 * @property {string} name - The name of the command
 * @property {string} description - The description of the command
 * @property {IGenerator} generator - The generator instance
 */
interface BaseGeneratorCommand {
  name: string;
  description: string;
}

/**
 * Interface for node generator commands
 * @interface NodeGeneratorCommand
 * @property {string} name - The name of the command
 * @property {string} description - The description of the command
 * @property {IGenerator} generator - The generator instance
 * @property {function} register - The function to register the command
 */

export interface NodeGeneratorCommand<TFlags = any>
  extends BaseGeneratorCommand {
  register(program: import('commander').Command): void;
}

/**
 * Interface for feature generator commands
 * @interface FeatureGeneratorCommand
 * @property {string} name - The name of the command
 * @property {IFeatureGenerator} generator - The generator instance
 * @property {function} register - The function to register the command
 */
export interface FeatureGeneratorCommand extends BaseGeneratorCommand {
  register(program: import('commander').Command): void;
}
