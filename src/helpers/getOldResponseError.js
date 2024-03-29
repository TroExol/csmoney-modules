const getOldResponseError = response => ({
    error: typeof response === 'string'
        ? Number(response.match(/(?<=\s|)\d+(?!\w)/)?.[0]) || undefined
        : undefined
});

export default getOldResponseError;