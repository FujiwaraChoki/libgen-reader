const buildFinalImageURL = (jobId: string) => {
    return `https://images.prodia.xyz/${jobId}.png`;
};

const generateImage = async (prompt: string) => {
    const initialJobResponse = await fetch(
        `https://api.prodia.com/generate?new=true&prompt=${encodeURIComponent(
            prompt
        )}&model=absolutereality_v181.safetensors+%5B3d9d4d2b%5D&negative_prompt=&steps=20&cfg=7&seed=4137814409&sampler=DPM%2B%2B+2M+Karras&aspect_ratio=square`,
        {
            headers: {
                accept: "*/*",
                "accept-language": "de-DE,de;q=0.6",
                "sec-ch-ua":
                    '"Chromium";v="122", "Not(A:Brand";v="24", "Brave";v="122"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1",
                Referer: "https://app.prodia.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
            body: null,
            method: "GET",
        }
    );

    const initialJob = await initialJobResponse.json();
    const jobId = initialJob.job;

    if (!jobId) {
        return {
            success: false,
            message: "Failed to generate image",
        };
    }

    let response: any = initialJobResponse;

    while (response) {
        // Wait for 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // Send a GET Request to check for status
        response = await fetch(`https://api.prodia.com/job/${jobId}`)
            .then((res) => res.json())
            .then((data) => data);

        console.log(`[INFO] Job Status => ${response.status}`);

        if (response.status === "succeeded") {
            break;
        }
    }

    const generatedImageURL = buildFinalImageURL(jobId);

    return {
        success: true,
        data: {
            imageURL: generatedImageURL,
        },
    };
}

export default generateImage;
