# Changelog

## [1.16.5 - 2026-02-02]

#### Fixed
- The `CodeActionContext.only` parameter was not respected for some code actions.
- Suggestions for global functions and constants were incorrectly prefixed with `\` without the appropriate setting enabled.
- The code lens for implementations did not appear for hooked properties.
- Document highlighting failed when the source was located within phpdoc comments.
- Abstract hooked properties were not flagged as unimplemented when missing.
- PHPDoc blocks immediately following another PHPDoc in class members were ignored.

## [1.16.4 - 2026-01-16]

#### Fixed
- Incorrect parsing of `@param` union types when followed by by-reference parameters.
- Template types weren't resolved to boolean literals as expected.
- Using `xor` caused language intelligence issues for following code.
- Anonymous class methods were being listed as object shape properties.
- Hover for variables displayed incorrect `@var` information in array destructuring.
- Index access types were not being resolved in some scenarios.
- Property type information was lost if both an annotation and a declaration existed for the same property name.
- Unresolved type aliases when referencing another type alias.
- Variables incorrectly identified as type `never` in `catch` blocks if the `try` block did not assign them.
- Union types for `$this` typehints were ignored.
- Function FQSENs in `@see` tags were not recognized.
- Dot files were not excluded despite matching exclude globs.
- Optional closure parameters in PHPDoc were incorrectly parsed.

## [1.16.3 - 2025-12-08]

#### Fixed
- Hover information was missing for methods named after PHP keywords or reserved names.
- Type aliases in types were only expanded once, not for all references.
- Global namespaced symbol suggestions weren't fully qualified in non-global namespaces when `insertUseDeclaration` was `false`.
- Incorrect type errors shown when comparing array shape tuples with typed arrays.
- Template types weren't resolved when constraint was `key-of` another template.
- Stub for `ldap-Set_option` was not accurate.
- PHPDoc following a `trait use` clause was ignored.

## [1.16.2 - 2025-11-27]

#### Fixed
- Type aliases used in foreach with iterators were not expanded correctly.
- Global scoped definitions appeared as undefined.
- Shorthand nullable parsing failed in `@method` tags.
- Variables defined in previous calls of a call chain were marked undefined.
- Variables defined inside `if` expressions were marked undefined.
- Templated closure parameters defaulted to `mixed` when types were declared but arguments were not supplied.
- Type narrowing of `$this` in traits failed.
- Visibility was not checked correctly when both an annotated and declared member shared a name.
- Type constants within type arguments of other types were not being expanded.

## [1.16.1 - 2025-11-22]

#### Fixed
- Stack overflow occurred when determining dynamic call return types.
- PHPDoc with `$this` as a type was not recognized.
- Incorrect diagnostics for member access when `__call` or `__get` could permit access to non-public members.
- Only the first class constant was offered as a suggestion when using comma-separated declarations in PHPDoc.
- Variables declared within an array element were not recognized in subsequent elements.
- Promoted properties with setter hooks showed `$value` as undefined.

## [1.16.0 - 2025-11-20]

#### Added
- Experimental support for PHP 8.5.

#### Changed
- Default PHP version is now 8.5.
- The `settings` section now uses the `markdownDescription` property.

#### Fixed
- Variables declared in a `for` loop initializer were not recognized in subsequent initializers.
- Variables declared in function argument lists were not recognized in subsequent arguments.
- Changes to array type variables outside of loops affected element type detection within loops.
- Details for `@param-out` and `@param-closure-this` were missing from hover tooltips.
- Hover links were not clickable due to missing angle brackets.
- Document links did not function correctly for URIs in `@see` and `@link`.
- The outline failed when `@property` names in PHPDoc missed the `$` prefix.
- Type errors occurred when assigning a generic type to a declared type lacking type arguments.
- Omitting template type arguments caused unresolved template errors.

## [1.15.3 - 2025-11-17]

#### Fixed
- Template constraints referencing another template did not resolve properly.
- Template types inside conditional types were not resolved as expected.
- Superglobal variables were undefined after indexing with open files.
- Callback parameters in `array_map` were inferred as `mixed` despite having type declarations.
- PHPDoc comments would incorrectly apply to subsequent statements.
- Anonymous class properties were flagged as undefined.
- Parsing errors occurred when `[]` was used as the default value for an `@method` parameter.
- `void` appeared as part of a union in inlay hint return types.
- Duplicate method/function return types were minimized in unions instead of preserving all variants.
- Properties without type declarations/annotations defaulted incorrectly; fallback via constructor was missing.
- HTML, JS, and CSS language features did not activate until edits were made to those sections.
- `$this` type narrowing was not effective.
- Go-to-definition failed for callable arrays using `__CLASS__` as the scope.
- Superfluous space remained at the end of the `<?php` suggestion.

## [1.15.2 - 2025-11-13]

#### Fixed
- Fixed several errors when accessing undefined properties and range calculations.
- Function suggestions clashed with class imports of the same name.
- Wrong indentation when applying override/implementation code suggestions.
- Type inference errors with `ArrayIterator` and its children.
- Incorrect type hints and suggestions for anonymous functions expecting a variadic parameter.

## [1.15.1 - 2025-11-12]

#### Fixed
- Formatting broke in mixed PHP/HTML files containing PHPDoc.
- Variable scoping errors after adding or removing new lines in functions/methods.
- `class_alias()` failed when passing a string literal instead of `::class`.
- `@method static` parsing was broken.
- PHPDoc after abstract methods was ignored, causing undefined method errors in some frameworks.
- `global $argv` declarations showed undefined variable warnings.
- Functions declared in encapsulating functions were not recognized.
- Custom `never` functions did not trigger all path return value diagnostics.

## [1.15.0 - 2025-11-11]

#### Added
- Support for LSP feature: `CompletionItemLabelDetails`.
- Ability to parse inline comments within array shapes.
- Added diagnostic for member access violations; previously shown as undefined member errors.
- Completion suggestions now include outer scope variables when inside anonymous functions, with edits to use statements.
- Anonymous function signatures are better suggested in call argument contexts.
- Fallback type provided for `non-empty-mixed`.
- Conditional types are now supported for parameters.
- Type narrowing using `is_subclass_of`.
- Improved suggestions for variable comparisons with literal union types in switch/match/equals contexts.
- Suggested array keys when assigning sub-arrays to array shapes.
- Option to set case style for parameter and property suggestion names via `intelephense.completion.parameterCase` (default: camel) and `intelephense.completion.propertyCase` (default: snake).
- Added support for `@param-closure-this` and `@param-out`.
- PHPDoc supports relative links, resolved according to the current file or workspace.
- Completion suggestions relative to existing partial use declarations are now available with a configuration setting.
- PHPDoc supports `MyClass::*` wildcard and non-wildcard class constant union types.
- Support for constants in PHPDoc union types (must be uppercase and fully-qualified).
- Autoclosing of short echo tags (`<?=`), configurable.
- Inlay hints for function return types, anonymous function parameter types, and argument parameter names, with settings to turn these hints off.
- Visibility modifiers now appear in the outline.
- Support for `SignatureHelp.activeSignature`.
- Suggested variable names for `compact()` calls.
- Support for `class_alias`.
- Document link navigation to required/included files.

#### Changed
- Removed workspace file limit; larger workspaces now use more resources.
- Trait name suggestions are shown in all contexts, not just in `use` clauses.
- Type/function/constant suggestions use flexible substring search.
- Improved suggestion sort order.
- FQSEN references in `@see` or `@uses` are handled more flexibly.
- Override code suggestions are displayed without needing a visibility modifier or the `function` keyword.
- Symbol search now uses substring matching and supports searching by partial FQSENs for more precise results.
- Stub files have been updated.
- Only named function calls are analyzed for `never` return types for performance reasons; others need explicit `return` or `throw` patterns.
- Override/implementation suggestions now include a parent call or an unimplemented throw as appropriate.

#### Fixed
- Renaming a constant reference would not update the declaration.
- Type suggestions after `@method static` were incorrect.
- Union type restrictions for templates were not inferred properly.
- Type aliases failed to resolve in certain situations.
- Inline `@see` tags would not hide URLs despite a description being provided.
- Statement keyword suggestions failed for control structures without braces.
- PHPDoc formatting above enum cases was incorrect.
- Type inference for `ArrayAccess` and its derivatives was inconsistent.
- Some keywords missing in switch expression completion suggestions.
- Parse errors when using `readonly` with anonymous classes.
- Array key suggestions were missing in constructor contexts.
- Incorrect method signature compatibility diagnostics triggered.
- Issues with control flow analysis in loops.
- Unused private promoted properties were not reported.
- Generator type arguments were incorrect if code exited before `yield`.
- Wrong diagnostic when using `readonly` with property hooks.
- Using `self` in trait call signatures did not resolve to the correct class.
- Intersected object types were not properly constructed for properties.
- Type errors for math extension operators due to operator overloading.
- Bad code generated for magic method implementation suggestions with abstract modifiers.
- Problems with smart select at the end of files not ending in a new line.
- Some stub symbols were missing due to empty PHPDoc tags.

## [1.14.4 - 2025-04-01]

#### Fixed
- No completion suggestions in PHPDoc comments.
- Incorrect error about all paths returning a value when returning from void functions.
- Incorrect error for static calls to non-static parent property hooks.
- String literal values representing class names were not resolved to classes with `class-string<T>`.
- Traits did not resolve `self` properly when used as a type argument.
- Incorrect return type errors when using templates and returning `static`.
- DocBlock indentation issues in `switch`/`case` statements.
- Unused import reports were incorrect for typedef annotations.
- No `$this` suggestion in anonymous functions within type definitions.
- Typedef types appearing in by-ref parameters were not expanded.
- Undefined method/function diagnostics incorrectly appeared after workspace indexing.

## [1.14.3 - 2025-03-05]

#### Fixed
- Spurious parser errors when editing code close to `if` or `try` blocks.

## [1.14.2 - 2025-03-01]

#### Fixed
- Parser errors appeared when editing mixed HTML/PHP containing short echo tags.
- Incorrect "not all paths return a value" errors for `try/finally`.
- Wrong method compatibility errors when overriding via a variadic parameter versus optional parameters.

## [1.14.1 - 2025-02-28]

#### Fixed
- Fixed `RangeError` for invalid array length.

## [1.14.0 - 2025-02-28]

#### Added
- Templated definitions provided for functions including `array_find`, `array_find_key`, `array_any`, `array_all`, `uasort`, `uksort`, `array_walk`, and `array_walk_recursive`.
- Array shape keys now suggested in return statements, function/method arguments, and destructuring.
- `default` included in match expression keyword suggestions.
- Property declaration name suggestions now sourced from type and base class declarations.
- Support for completion suggestion insert/replace ranges.
- Type name suggestions now consider the file name.
- Namespace suggestions based on the file and `composer.json`.

#### Changed
- Stubs updated.
- PHPDoc for variadic parameters (where `...` is omitted and type is array) now describes the type inside the function.
- Built-in types (e.g., `string`, `int`) passed to `class-string<T>` now resolve to the built-in type.
- Parameter declaration name suggestions now include variations such as snake_case and shorter alternatives.

#### Fixed
- `@disregard` could not be used to suppress property diagnostics.
- Fixed return type diagnostics for traits.
- Incorrect generator return type detection.
- Property type inference incorrectly handled redundant scope types.
- Type narrowing with null coalesce assignment was broken.
- Assigning `$this` to a property produced false errors.
- Array type was unintentionally erased when assigning an empty array to a multidimensional element.
- Unused method diagnostics were triggered incorrectly inside `$this instanceof` conditions.
- `list<>` keys were typed as `int|string` instead of `int`.
- Incorrect method compatibility error when override used variadic params.
- Formatter would miss formatting when only leading trivia fell in the selection.
- Named argument suggestion was case sensitive (now fixed).
- File renames now consider `composer.json` `autoload-dev`.

## [1.13.1 - 2024-12-30] Pre-release

#### Fixed
- Fixed parse errors when editing open PHP tags with `intelephense.environment.shortOpenTag` enabled.
- Default PHP version is now 8.4.
- Added missing `frakenphp` to stub enums.
- False diagnostics for implicit nullable parameters with `mixed` type.
- Abstractness error for PHP 8.4 abstract properties was incorrect.
- Union types between `Traversable` and empty arrays lost template parameters.

## [1.13.0 - 2024-12-17] Pre-release

#### Added
- Support for PHP 8.4 class member access during instantiation without parentheses.
- PHP 8.4 property hooks support.
- Asymmetric visibility handling for PHP 8.4.
- Deprecated diagnostics for implicit nullable parameters in PHP 8.4.
- Support for `@mixin` template types for improved inference (useful for Laravel 11).
- New setting `intelephense.diagnostics.memberAccess` to enable/disable member access diagnostics (default: true).

#### Changed
- Default PHP version updated to 8.4.
- Stub files updated.
- Parent and Overrides code lenses now only appear for methods with actual parent/override relations to reduce noise.

#### Fixed
- Crash on parsing PHPDoc with multi-line conditional types.
- `Traversable` not considered covariant to `iterable`.
- Some `$_SERVER` elements had incorrect types.
- Enums were not detected as implementing interfaces.
- Incorrect parse errors for empty heredoc syntax.
- Nullsafe operator type narrowing did not work.
- Template types for `__invoke` were unresolved.
- Go-to-type-definition didn't function for `foreach` values.
- Comment formatting above `default` in match expressions was broken.
- Incorrect method signature diagnostics with older PHP versions.
- Wrong variable type inferred as `never` within while loops using logical conditions.
- Readonly property initialization in trait-exhibiting classes was flagged as invalid in error.
- Formatting was wrong for selections inside multi-line call chains.
- Template types for `Iterator` not resolved when passed to `iterable`.

## [1.12.6 - 2024-09-09]

#### Fixed
- Template types were incorrect when implementing `Iterator`.
- Loss of template types for `Traversable`.
- Fully qualified `assert` did not work.
- False "unset variable" error after logical expressions using `or`.
- No variable suggestions for those declared in array destructures.
- Function return types were reduced too eagerly.
- Unused symbol diagnostic appeared for promoted properties without a visibility modifier.