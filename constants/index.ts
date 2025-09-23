export const DAYS_OF_WEEK_IN_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

export const PrivateNavLinks = [
{
    imgURL: './events.svg',
    label: 'My Events',
    route: '/events'
},
{
    imgURL: './schedule.svg',
    label: 'My Schedule',
    route: '/schedule'
},
{
    imgURL: './public.svg',
    label: 'Public Profile',
    route: '/book'
}
] as const;