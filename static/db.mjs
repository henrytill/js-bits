// @ts-check

/**
 * @typedef {string} DatabaseName
 * @typedef {number} DatabaseVersion
 * @typedef {string} ObjectStoreName
 */

/**
 * Arguments to `IDBObjectStore.createIndex`.
 *
 * @typedef {object} Index
 * @property {string} name
 * @property {string | string[] } keyPath
 * @property {IDBIndexParameters} indexParameters
 */

/**
 * Modifies a database.  Intended to be used with `openDatabase`.
 *
 * @typedef {(db: IDBDatabase) => IDBDatabase} DatabaseModifier
 */

/**
 * @typedef {{ open: (name: string, version?: number) => IDBOpenDBRequest }} HasOpen
 * @typedef {{ deleteDatabase: (name: string) => IDBOpenDBRequest }} HasDeleteDatabase
 */

/**
 * Returns a `DatabaseModifier` that is used to create an object store with the
 * given name, parameters, and indices.  Intended to be used with `openDatabase`.
 *
 * @param {ObjectStoreName} objectStoreName
 * @param {IDBObjectStoreParameters} objectStoreParameters
 * @param {Index[]} indices
 * @returns {DatabaseModifier}
 * @throws {DOMException}
 */
export const makeObjectStoreCreator = (
  objectStoreName,
  objectStoreParameters,
  indices,
) => {
  return (/** @type {IDBDatabase} */ db) => {
    const objectStore = db.createObjectStore(
      objectStoreName,
      objectStoreParameters,
    );
    for (const { name, keyPath, indexParameters } of indices) {
      objectStore.createIndex(name, keyPath, indexParameters);
    }
    return db;
  };
};

/** @enum {number} */
export const OpenDatabaseResultTag = {
  Success: 0,
  UpgradeNeeded: 1,
};

/**
 * @typedef {object} OpenDatabaseResult
 * @property {OpenDatabaseResultTag} tag
 * @property {IDBDatabase} db
 */

/**
 * An async wrapper for `indexedDB.open`.
 *
 * @param {HasOpen} db
 * @param {DatabaseName} dbName
 * @param {DatabaseVersion} dbVersion
 * @param {DatabaseModifier} objectStoreCreator
 * @returns {Promise<OpenDatabaseResult>}
 */
export const openDatabase = (db, dbName, dbVersion, objectStoreCreator) => {
  return new Promise((resolve, reject) => {
    /** @type {IDBOpenDBRequest} */
    let openRequest;
    try {
      openRequest = db.open(dbName, dbVersion);
      openRequest.onerror = (_) => {
        return reject(openRequest.error);
      };
      openRequest.onsuccess = (_) => {
        const db = openRequest.result;
        return resolve({ tag: OpenDatabaseResultTag.Success, db });
      };
      openRequest.onupgradeneeded = (_) => {
        try {
          const db = objectStoreCreator(openRequest.result);
          return resolve({ tag: OpenDatabaseResultTag.UpgradeNeeded, db });
        } catch (error) {
          if (openRequest.result) {
            openRequest.result.close();
          }
          return reject(error);
        }
      };
    } catch (error) {
      return reject(error);
    }
  });
};

/** @enum {number} */
export const DeleteDatabaseResultTag = {
  Success: 0,
  Blocked: 1,
};

/**
 * @typedef {object} DeleteDatabaseResult
 * @property {DeleteDatabaseResultTag} tag
 */

/**
 * An async wrapper for `indexedDB.deleteDatabase`.
 *
 * @param {HasDeleteDatabase} db
 * @param {DatabaseName} dbName
 * @returns {Promise<DeleteDatabaseResult>}
 */
export const deleteDatabase = (db, dbName) => {
  return new Promise((resolve, reject) => {
    const deleteRequest = db.deleteDatabase(dbName);
    deleteRequest.onerror = (_) => {
      return reject(deleteRequest.error); // is it even possible to hit this?
    };
    deleteRequest.onsuccess = (_) => {
      return resolve({ tag: DeleteDatabaseResultTag.Success });
    };
    deleteRequest.onblocked = (_) => {
      return resolve({ tag: DeleteDatabaseResultTag.Blocked });
    };
  });
};
