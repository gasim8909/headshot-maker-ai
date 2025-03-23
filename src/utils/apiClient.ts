/**
 * API client utility for making HTTP requests
 */

/**
 * Make a POST request to the specified endpoint
 * @param {string} url - The API endpoint to call
 * @param {Object} data - The data to send in the request body
 * @returns {Promise<any>} - The response data
 */
export async function postData(url: string, data: any): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Make a GET request to the specified endpoint
 * @param {string} url - The API endpoint to call
 * @returns {Promise<any>} - The response data
 */
export async function getData(url: string): Promise<any> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
