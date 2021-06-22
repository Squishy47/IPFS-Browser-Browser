import IPFS from "ipfs";

/**
 * Fetch API to list files from directory
 * @param {String} path
 * @returns {Object}
 */

let ipfs = null;

export async function startIPFS() {
	if (!ipfs) ipfs = await IPFS.create();
}

// DONE
export async function list(path) {
	if (!ipfs) return new Promise();

	let data = [];

	for await (const file of ipfs.files.ls(path)) {
		data.push(file);
	}

	return {
		ok: true,
		isJson: true,
		isAttachment: false,
		json: {
			success: true,
			data: data,
		},
	};
}

/**
 * Fetch API to create a directory
 * @param {String} path
 * @param {String} directory
 * @returns {Object}
 */
// DONE
export async function createDirectory(path, directory) {
	if (!ipfs) return new Promise();

	await ipfs.files.mkdir(`${path}/${directory}`);

	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

/**
 * Fetch API to get file body
 * @param {String} path
 * @returns {Object}
 */
export async function getFileContent(path) {
	if (!ipfs) return;

	const stats = await ipfs.files.stat(path);

	let blob = null;
	for await (const file of ipfs.get(stats.cid)) {
		if (!file.content) continue;

		console.log(file);

		const content = [];

		for await (const chunk of file.content) {
			content.push(chunk);
		}

		blob = new Blob(content);
	}

	return {
		ok: true,
		isJson: false,
		isAttachment: true,
		blob: () => {
			return blob;
		},
	};
}

/**
 * Fetch API to remove a file or folder
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
// DONE
export async function remove(path, filenames, recursive = true) {
	if (!ipfs) return new Promise();

	await Promise.all(
		filenames.map((filename) =>
			ipfs.files.rm(`${path}/${filename}`, { recursive: recursive })
		)
	);

	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

/**
 * Fetch API to move files
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
// DONE
export async function move(path, destination, filenames) {
	await copy(path, destination, filenames);
	await remove(path, filenames);

	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

/**
 * Fetch API to move files
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
export async function rename(path, destination) {
	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

/**
 * Fetch API to copy files
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
// DONE
export async function copy(path, destination, filenames) {
	await Promise.all(
		filenames.map((filename) =>
			ipfs.files.cp(`${path}/${filename}`, `${destination}`)
		)
	);
	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

/**
 * Fetch API to copy files
 * @param {String} path
 * @param {Object<FileList>} fileList
 * @returns {Object}
 */
// DONE
export async function upload(path, fileList, formData = new FormData()) {
	let files = [];

	for (let i = 0; i < fileList.length; i++) {
		files.push({
			path: `${path}/${fileList[i].name}`,
			content: fileList[i],
		});
	}

	await Promise.all(
		files.map((file) => {
			return ipfs.files.write(`${file.path}`, file.content, {
				create: true,
				parents: true,
			});
		})
	);

	return {
		ok: true,
		isJson: false,
		isAttachment: false,
	};
}

// TODO - copy and move files to base directory
// TODO - rename files and folders
// TODO - user login
// TODO - file encryption
