document.addEventListener('DOMContentLoaded', function () {
    // Fetch votes and reorder content based on upvotes
    fetch('/get_votes')
        .then(response => response.json())
        .then(votes => {
            const carousels = document.querySelectorAll('.carousel');
            carousels.forEach(carousel => {
                let itemsArray = Array.from(carousel.children);
                // Sort items within each carousel based on votes
                itemsArray.sort((a, b) => {
                    const idA = a.dataset.id;
                    const idB = b.dataset.id;
                    const votesA = votes[idA] ? votes[idA].upvotes : 0;
                    const votesB = votes[idB] ? votes[idB].upvotes : 0;
                    return votesB - votesA;
                });
                // Reattach sorted items to the carousel
                itemsArray.forEach(item => carousel.appendChild(item));
            });
        })
        .catch(error => console.error('Error fetching vote counts:', error));

    // Manage content type navigation
    const columns = document.querySelectorAll('.column');
    let activeIndex = 0;

    const showContent = (index) => {
        columns.forEach(column => column.style.display = 'none'); // Hide all columns
        columns[index].style.display = 'block'; // Show the active column
    };

    showContent(activeIndex); // Initially show the first content type

    document.getElementById('next-content').addEventListener('click', () => {
        activeIndex = (activeIndex + 1) % columns.length; // Move to the next content type
        showContent(activeIndex);
    });

    document.getElementById('prev-content').addEventListener('click', () => {
        activeIndex = (activeIndex - 1 + columns.length) % columns.length; // Move to the previous content type
        showContent(activeIndex);
    });

    // Voting button functionality with instant feedback
    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', function () {
            const voteType = this.dataset.voteType; // Assuming data-vote-type attribute is "up" or "down"
            const mediaId = this.closest('.media-card').dataset.id;
            const voteCountElement = this.nextElementSibling;

            // Simulate vote submission
            fetch(`/submit_vote?mediaId=${mediaId}&voteType=${voteType}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        voteCountElement.textContent = data.newCount; // Update the count instantly
                    } else {
                        alert('Failed to submit vote. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error submitting vote:', error);
                    alert('Error submitting vote. Please check your network connection.');
                });
        });
    });

    // Lazy loading for images and iframes
    const lazyLoadMedia = document.querySelectorAll('img[data-src], iframe[data-src]');
    lazyLoadMedia.forEach(media => {
        media.setAttribute('src', media.getAttribute('data-src'));
        media.removeAttribute('data-src');
    });
});
