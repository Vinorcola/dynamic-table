# State watcher

The aims of the state watcher is to save a `DynamicTable`'s state (filter, sort, columns mask & pagination) somewhere and to load that latest state back when the `DynamicTable` is mounted again (e.g. after page navigation back and forth).

## Provided strategies

The package provide 2 default implementations:
* NoopWatcher (default if no namespace prop provided to the `DynamicTable`): Do not save anything and reset the `DynamicTable`'s state at each mount.
* LocalStorageWatcher (default if namespace prop provided to the `DynamicTable`): Save state changes in LocalStorage (state is concerved even if browser is closed).

## Custom strategy

You can implement your own strategy and set your custom watcher using `DynamicTable`'s props. An example of custom watcher could be to save state using an HTTP API.

## Inital state override

Note that any given initial state via `DynamicTable`'s props will take precedence over the watcher's state.
