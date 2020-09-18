export interface watcher {
    id: number;
    ref: Function;
}

export class SimpleStateManagement {
    private watchCounter = 0;
    private watchersPool: Record<string, Array<watcher>>;

    private static storeId = "ssm_store";
    private static instance: SimpleStateManagement;

    constructor() {
        if (SimpleStateManagement.instance) {
            return SimpleStateManagement.instance;
        }
        SimpleStateManagement.instance = this;
        this.watchersPool = {};
        window[SimpleStateManagement.storeId] = {};
    }

    /**
     * Reads and returns current slice data
     * @param path - path to state slice
     */
    read(path: string) {
        const data = this.readFromPath(path, window[SimpleStateManagement.storeId])
        return data;
    }

    /**
     * Writes new state slice
     * @param path - path to state slice
     * @param payload - data to be written
     */
    write<T>(path: string, payload: T) {
        //Write data
        this.writeToPath(path, window[SimpleStateManagement.storeId], payload);

        // Notify listeners
        this.notifyWatchers(path);
    }

    /**
     * Registers callback function to be called when data slice is modified
     * @param path - path to state slice
     * @param callback - function to be called
     */
    watch(path: string, callback: Function) {
        this.watchCounter++;
        this.watchersPool[path] = [{id: this.watchCounter, ref: callback}];

        const idRef = this.watchCounter;
        return () => {
            this.unwatch(idRef, path);
        }
    }

    /**
     * 
     * @param idRef Removes watcher from watchersPool
     * @param path - path to state slice
     */
    private unwatch(idRef: number, path: string) {
        const pathWatchers = this.watchersPool[path];
        for (const watcher in pathWatchers) {
            if (pathWatchers[watcher].id === idRef) {
                delete pathWatchers[watcher];
            }
        }
    }

    /**
     * Calls all watchers update callbacks for given slice
     * @param path - path to state slice
     */
    private notifyWatchers(path: string) {
        if (!this.watchersPool) return;
        const pathWatchers = this.watchersPool[path];
        for (const watcher in pathWatchers) {
            pathWatchers[watcher].ref();
        }
    }

    /**
     * Resolves location and gets data
     * @param path - path to state slice
     * @param obj - reference to store
     */
    private readFromPath(path: string, obj: Object) {
        const delimiterIndex = path.indexOf("/");
        const currPath = path.substring(0, delimiterIndex);
        const restPath = path.substring(delimiterIndex + 1, path.length);
        if (delimiterIndex === -1) { // Leaf
            return obj[path];
        } else { // Try go deeper
            if (!obj[currPath]) return undefined;
            return this.readFromPath(restPath, obj[currPath]);
        }
    }

    /**
     * Writes data to proper slice of store
     * @param path - path to state slice
     * @param obj - reference to store
     * @param data - data to write to slice
     */
    private writeToPath<T>(path: string, obj: Object, data: T) {
        const delimiterIndex = path.indexOf("/");
        const currPath = path.substring(0, delimiterIndex);
        const restPath = path.substring(delimiterIndex + 1, path.length);
        if (delimiterIndex === -1) { // Leaf
            obj[path] = data;
        } else { // Go deeper and build object if needed
            if (!obj[currPath]) {
                obj[currPath] = {};
            }
            this.writeToPath(restPath, obj[currPath], data);
        }
    }
}
