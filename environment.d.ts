declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MY_SECRET: string;
			MY_SECRET_REFRESH: string;
		}
	}
}

export {};
