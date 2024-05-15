import { Link as MuiLink } from '@mui/material'
import { Link } from 'react-router-dom'

type RouterLinkProps = Pick<Parameters<typeof Link>[0], 'to'> & Parameters<typeof MuiLink>[0]

export function RouterLink({ to, children }: RouterLinkProps) {
  return (
    <MuiLink sx={{ cursor: 'pointer' }} to={to} component={Link}>
      {children}
    </MuiLink>
  )
}
