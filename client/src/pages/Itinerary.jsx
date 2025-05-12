import React from "react";

export default function Itinerary() {
  // Mock current user
  const currentUser = { uid: "123", displayName: "John Doe", email: "john@example.com" }

  return (
    <div className="flex min-h-screen flex-col bg-[#f2f2f2]">
      <Navbar currentUser={currentUser} />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">My Itineraries</h1>
            <p className="text-gray-600">Create and manage your travel plans</p>
          </div>
          <Button className="flex items-center gap-2 rounded-full bg-black px-6 py-6 text-white hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            <span>Create New Itinerary</span>
          </Button>
        </div>

        <Alert className="mb-8 rounded-xl border-0 bg-white shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>The itinerary builder functionality will be available soon.</AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm">
            <CardContent className="p-8">
              <h3 className="mb-1 text-xl font-bold">Weekend in Paris</h3>
              <p className="mb-6 text-gray-600">May 15-17, 2023</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium">Draft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destinations:</span>
                  <span className="font-medium">Paris, France</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Activities:</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <Button variant="outline" className="mt-6 w-full rounded-full bg-white hover:bg-gray-100">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm">
            <CardContent className="p-8">
              <h3 className="mb-1 text-xl font-bold">Summer in Barcelona</h3>
              <p className="mb-6 text-gray-600">July 10-20, 2023</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destinations:</span>
                  <span className="font-medium">Barcelona, Spain</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Activities:</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
              <Button variant="outline" className="mt-6 w-full rounded-full bg-white hover:bg-gray-100">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 border-dashed border-gray-300 bg-white shadow-sm">
            <CardContent className="flex h-[280px] flex-col items-center justify-center p-8">
              <h3 className="mb-1 text-xl font-bold text-gray-500">Start Planning</h3>
              <p className="mb-6 text-center text-gray-500">Create a new travel itinerary</p>
              <Button variant="outline" size="lg" className="h-16 w-16 rounded-full">
                <Plus className="h-6 w-6" />
                <span className="sr-only">Create new itinerary</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
