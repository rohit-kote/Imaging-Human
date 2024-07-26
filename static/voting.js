document.addEventListener('DOMContentLoaded', function () {
    fetch('/get_votes')
        .then(response => response.json())
        .then(updateVoteCounts)
        .catch(error => console.error('Error fetching vote counts:', error));

    // Using event delegation to handle votes on dynamic content
    document.body.addEventListener('click', function (event) {
        if (event.target.classList.contains('vote-btn')) {
            const button = event.target;
            const mediaCard = button.closest('.media-card');
            if (!mediaCard) return;

            const contentID = mediaCard.getAttribute('data-id');
            const voteType = button.textContent.includes('👍') ? 'upvotes' : 'downvotes';
            const mood = mediaCard.getAttribute('data-mood'); // Optional mood attribute
            const contentType = mediaCard.getAttribute('data-content-type'); // Optional content type attribute

            console.log('Attempting to send vote:', { contentID, voteType, mood, contentType }); // Debugging output

            fetch('/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentID, voteType, mood, contentType })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(() => fetch('/get_votes'))
                .then(response => response.json())
                .then(updateVoteCounts)
                .catch(error => console.error('Error processing vote:', error));
        }
    });
});

function updateVoteCounts(votes) {
    Object.keys(votes).forEach(id => {
        const upvoteSpan = document.getElementById(`upvote-count-${id}`);
        const downvoteSpan = document.getElementById(`downvote-count-${id}`);
        if (upvoteSpan) upvoteSpan.textContent = votes[id].upvotes;
        if (downvoteSpan) downvoteSpan.textContent = votes[id].downvotes;
    });
}
