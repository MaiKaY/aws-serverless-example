/* eslint-disable import/prefer-default-export */

export const handler = async (event, context, callback) => {
    console.log(JSON.stringify(event, null, 4));
    callback(null, 'Done.');
};
