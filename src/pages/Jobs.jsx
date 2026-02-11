import { Link } from 'react-router-dom'

const jobListings = [
  { id: 1, title: 'Senior Software Engineer', company: 'Meta', location: 'Menlo Park, CA', image: '/images/job-hiring-banner.png', posted: '2d' },
  { id: 2, title: 'Full Stack Engineer', company: 'Microsoft', location: 'Seattle, WA · Remote', image: '/images/software-engineer-job.png', posted: '3d' },
  { id: 3, title: 'Engineering Manager', company: 'Amazon', location: 'New York, NY · Remote', image: '/images/sponsored-career-ad.png', posted: '5d' },
  { id: 4, title: 'Product Manager', company: 'Notion', location: 'San Francisco, CA', image: '/images/tech-update-launch.png', posted: '1w' },
]

export default function Jobs() {
  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
        <p className="mt-1 text-sm text-linkedin-text-gray">Explore opportunities that match your skills</p>
        <div className="mt-6 space-y-4">
          {jobListings.map((job) => (
            <div
              key={job.id}
              className="overflow-hidden rounded-lg border border-linkedin-border-gray bg-linkedin-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-24 overflow-hidden bg-linkedin-light-gray sm:h-32">
                <img
                  src={job.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-gray-900">{job.title}</h2>
                <p className="text-sm text-linkedin-text-gray">{job.company}</p>
                <p className="mt-1 text-xs text-linkedin-text-gray">{job.location}</p>
                <p className="mt-2 text-xs text-linkedin-text-gray">Posted {job.posted} ago</p>
                <Link
                  to="/"
                  className="mt-3 inline-block rounded-full border border-linkedin-primary px-4 py-2 text-sm font-medium text-linkedin-primary transition hover:bg-linkedin-primary hover:text-linkedin-white"
                >
                  Easy Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
