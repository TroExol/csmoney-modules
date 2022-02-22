const getOldResponseError = response => typeof response === 'string'
    ? {error: Number(response.match(/(?<=\s|)\d+(?!\w)/)?.[0]) || undefined}
    : undefined;

export default getOldResponseError;