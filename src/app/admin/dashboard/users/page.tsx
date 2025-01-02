'use client';

import { getUsers, deleteUser, createUser } from '@/actions/user-actions';
import { User, UserRole } from '@/interfaces/users';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import BreadcrumbsComponent from '@/components/Breadcrumbs';
import YesNoRadio from '@/components/YesNoRadio';
import { Visibility, VisibilityOff } from '@mui/icons-material';



const initialNewUser: User = {
  _id: "",
  name: '',
  email: '',
  password: "",
  role: 'user',
  isActive: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState<User>(initialNewUser);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({}); // Track touched fields
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { token } = useAuth();
  const router = useRouter();
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (token) {
        const fetchedUsers = await getUsers(token);
        setUsers(fetchedUsers);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id); // Call your delete API function
        setSuccess(true); // Set success state
        fetchUsers();// Refresh the route to update the table
      } catch (error: any) {
        setError('Error deleting user.');
        console.error('Delete error:', error);
      }
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleActiveChange = (value: boolean) => {
    setNewUser((prevUser) => ({ ...prevUser, isActive: value }));
  }


  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();

    console.log("Iam here")
    // Trigger validation for all fields
    const fieldsToValidate = Object.keys(initialNewUser).filter(
      (field) => field !== '_id' // Exclude `_id` from validation for user creation
    ) as (keyof Omit<User, '_id'>)[]; const updatedTouched = fieldsToValidate.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    setTouched(updatedTouched);

    // Check for validation errors
    const hasError = fieldsToValidate.some((field) => !newUser[field]);
    console.log("hasError" + hasError)
    if (hasError) {
      // Find the first field with an error
      const firstEmptyField = fieldsToValidate.find((field) => !newUser[field]);
      console.error(`Field "${firstEmptyField}" is required.`); // Log the field name
      return;
    }
    try {
      console.log("----------------1")
      await createUser(newUser);
      setSuccessMessage('User created successfully!');
      setErrorMessage(null);
      setOpenDialog(false);
      setNewUser(initialNewUser);
      fetchUsers();
      setOpenDialog(false);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Error creating user.');
      setSuccessMessage(null);
      console.error('Create error:', error);
    }
  };
  const handleOpenDialog = () => {
    setNewUser(initialNewUser); // Reset the form here!
    const allFields = Object.keys(newUser) as (keyof User)[];
    const updatedTouched = allFields.reduce(
      (acc, field) => ({ ...acc, [field]: false }),
      {}
    );
    setTouched(updatedTouched);
    setOpenDialog(true);

  };
  const handleEdit = (user: User) => {
    setIsEditing(true);
    setEditingUser(user);
    setNewUser({ ...user, password: '' });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsComponent />
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Create User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <div className='flex space-x-2'>
                    <Button onClick={() => user._id && handleEdit(user)}
                      color="error">
                      Edit
                    </Button>
                    <Button onClick={() => user._id && handleDelete(user._id)}
                      color="error">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={success && !openDialog} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          User action successful!
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField
            type="hidden"
            name="_id"
            value={newUser._id}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            name="name"
            value={newUser.name}
            onChange={handleInputChange}
            error={touched.name && !newUser.name}
            helperText={touched.name && !newUser.name ? "Name is required" : ""}
          />

          <TextField
            margin="dense"
            label="Email"
            fullWidth
            variant="outlined"
            name="email"
            value={newUser.email}
            autoComplete="new-email"
            inputMode="none"
            onChange={handleInputChange}
            error={touched.email && !newUser.email}
            helperText={touched.email && !newUser.email ? "Email is required" : ""}
          />
          <TextField
            margin="dense"
            label="Password"
            fullWidth
            variant="outlined"
            name="password"
            autoComplete="new-password"
            inputMode="none"
            type={showPassword ? 'text' : 'password'}
            value={newUser.password || ""}
            onChange={handleInputChange}
            error={touched.password && !newUser.password}
            helperText={touched.password && !newUser.password ? "Password is required" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={newUser.role}
              label="Role"
              onChange={(event) =>
                setNewUser((prevUser) => ({
                  ...prevUser,
                  role: event.target.value as UserRole,
                }))
              }
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <YesNoRadio value={newUser.isActive} onChange={handleActiveChange} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}