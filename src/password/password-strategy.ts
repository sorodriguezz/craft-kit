export interface IPasswordStrategy<TParams> {
  generate(options: TParams): string;
}
