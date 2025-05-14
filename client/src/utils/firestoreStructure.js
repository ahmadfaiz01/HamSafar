/*
Firestore Database Structure for Itineraries:

Collection: users
   Document: {userId}
      Collection: itineraries
         Document: {itineraryId}
            - tripName: string
            - source: string
            - destination: string
            - numberOfDays: number
            - notes: string
            - startDate: timestamp (optional)
            - endDate: timestamp (optional)
            - createdAt: timestamp
            - dayPlans: array
               - day: number
               - date: string
               - activities: array
                 - time: string
                 - description: string
                 - location: string
                 - notes: string
               - accommodation: string
               - transportation: string
               - notes: string
            - recommendations: object
               - dining: array of strings
               - attractions: array of strings
               - shopping: array of strings
               - transportation: array of strings
            - estimatedBudget: string
*/